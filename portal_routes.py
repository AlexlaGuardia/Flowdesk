import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from auth import get_current_user, generate_share_token
from models import MessageResponse
import db
import config
import email_service

router = APIRouter(tags=["portal"])


# ── Authenticated File Management ──

@router.post("/projects/{project_id}/files", response_model=MessageResponse)
async def upload_file(
    project_id: int,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload a file to a project (freelancer side)."""
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_id = await _save_file(project_id, file, "freelancer")
    return {"message": "File uploaded", "id": file_id}


@router.get("/projects/{project_id}/files")
async def list_files(project_id: int, user: dict = Depends(get_current_user)):
    """List all files for a project."""
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    files = db.query(
        "SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC",
        (project_id,)
    )
    return files


@router.patch("/projects/{project_id}/files/{file_id}/review", response_model=MessageResponse)
async def review_file(
    project_id: int,
    file_id: int,
    status: str,
    feedback: str = "",
    user: dict = Depends(get_current_user),
):
    """Review a file (approve or request revision)."""
    if status not in ("approved", "revision_requested"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'revision_requested'")

    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    f = db.query(
        "SELECT * FROM files WHERE id = ? AND project_id = ?",
        (file_id, project_id), one=True
    )
    if not f:
        raise HTTPException(status_code=404, detail="File not found")

    db.execute(
        "UPDATE files SET status = ?, feedback = ? WHERE id = ?",
        (status, feedback, file_id)
    )

    return {"message": f"File marked as {status}"}


@router.get("/files/{file_id}/download")
async def download_file(file_id: int, user: dict = Depends(get_current_user)):
    """Download a file."""
    f = db.query("SELECT * FROM files WHERE id = ?", (file_id,), one=True)
    if not f:
        raise HTTPException(status_code=404, detail="File not found")

    # Verify user owns the project
    project = db.query(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (f["project_id"], user["id"]), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Not authorized")

    if not os.path.exists(f["file_path"]):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(f["file_path"], filename=f["filename"])


# ── Public Client Portal ──

@router.get("/portal/{share_token}")
async def client_portal(share_token: str):
    """Public: Client portal view for a project via project share token."""
    project = db.query(
        "SELECT * FROM projects WHERE share_token = ?",
        (share_token,), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Portal not found")
    user = db.query("SELECT * FROM users WHERE id = ?", (project["user_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)

    milestones = db.query(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at",
        (project["id"],)
    )
    files = db.query(
        "SELECT id, filename, file_type, file_size, status, feedback, uploaded_by, created_at FROM files WHERE project_id = ? ORDER BY created_at DESC",
        (project["id"],)
    )
    invoices = db.query(
        "SELECT invoice_number, total, status, due_date, share_token, created_at FROM invoices WHERE project_id = ? ORDER BY created_at DESC",
        (project["id"],)
    )

    return {
        "project": {
            "name": project["name"],
            "description": project["description"],
            "status": project["status"],
            "total_amount": project["total_amount"],
            "paid_amount": project["paid_amount"],
            "start_date": project["start_date"],
            "due_date": project["due_date"],
        },
        "freelancer": {
            "name": user["name"],
            "business_name": user["business_name"],
            "brand_color": user["brand_color"],
        },
        "client": {"name": client["name"]},
        "milestones": milestones,
        "files": files,
        "invoices": invoices,
    }


@router.post("/portal/{share_token}/upload", response_model=MessageResponse)
async def client_upload_file(
    share_token: str,
    file: UploadFile = File(...),
):
    """Public: Client uploads a file to the project portal."""
    project = db.query(
        "SELECT * FROM projects WHERE share_token = ?",
        (share_token,), one=True
    )
    if not project:
        raise HTTPException(status_code=404, detail="Portal not found")
    if project["status"] not in ("active", "proposed"):
        raise HTTPException(status_code=400, detail="Project is not accepting uploads")

    file_id = await _save_file(project["id"], file, "client")

    # Notify freelancer
    user = db.query("SELECT * FROM users WHERE id = ?", (project["user_id"],), one=True)
    client = db.query("SELECT * FROM clients WHERE id = ?", (project["client_id"],), one=True)
    email_service.send_file_upload_notification(
        to_email=user["email"],
        client_name=client["name"],
        project_name=project["name"],
        filename=file.filename,
        project_id=project["id"],
    )

    return {"message": "File uploaded", "id": file_id}


# ── Helpers ──

async def _save_file(project_id: int, file: UploadFile, uploaded_by: str) -> int:
    """Save an uploaded file to disk and database."""
    # Validate size
    content = await file.read()
    if len(content) > config.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {config.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Create project upload directory
    project_dir = config.UPLOAD_DIR / str(project_id)
    project_dir.mkdir(parents=True, exist_ok=True)

    # Save file with unique name to avoid collisions
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    file_path = project_dir / safe_name

    # Handle duplicate filenames
    counter = 1
    stem = file_path.stem
    suffix = file_path.suffix
    while file_path.exists():
        file_path = project_dir / f"{stem}_{counter}{suffix}"
        counter += 1

    with open(file_path, "wb") as f:
        f.write(content)

    file_id = db.execute(
        """INSERT INTO files (project_id, uploaded_by, filename, file_path, file_type, file_size)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (project_id, uploaded_by, file.filename, str(file_path),
         file.content_type or "", len(content))
    )

    return file_id
