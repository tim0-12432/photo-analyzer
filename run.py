import subprocess
import os

VENV = ".venv"

def execute(dir, command):
    process = subprocess.Popen(f"cd {dir} && {command}", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    preprocessed, _ = process.communicate()
    print(str(preprocessed, "utf-8"))


def execute_in_venv(dir, command):
    execute(dir, f"{VENV}\\Scripts\\activate.bat && {command}")


def info_message(msg):
    print(f" --- ### {msg} ### --- ")


if __name__ == '__main__':
    workspace = os.path.dirname(os.path.abspath(__file__))
    backend = os.path.join(workspace, 'backend')
    frontend = os.path.join(workspace, 'frontend')

    if not os.path.exists(os.path.join(frontend, "dist")):
        info_message("Building frontend...")
        execute(frontend, "npm install && npm run build")
    else:
        info_message("Frontend already built. Build step skipped.")

    if not os.path.exists(os.path.join(backend, ".venv")):
        info_message("Creating virtual environment...")
        execute(backend, f"python -m venv {VENV}")
    else:
        info_message("Virtual environment already created. Creation step skipped.")

    info_message("Installing backend dependencies...")
    execute_in_venv(backend, "pip install -r requirements.txt")

    info_message("Starting backend server...")
    subprocess.call(f"cd {os.getcwd()} && {os.path.join(backend, VENV)}\\Scripts\\activate.bat && python {os.path.join(backend, 'server.py')}", shell=True)
