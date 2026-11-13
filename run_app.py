import os
import sys
import subprocess
import webbrowser
import time

def main():
    print("=" * 70)
    print("  AarogyaVani - Missed-Dose & Follow-Up Companion")
    print("  Powered by Sarvam AI (Bulbul:v3 + 105b-conversations)")
    print("=" * 70)
    print("\nStarting unified FastAPI server on http://localhost:8000 ...")

    # Run Uvicorn backend which also serves the compiled React frontend dist
    python_exe = sys.executable
    server_cmd = [python_exe, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
    
    proc = subprocess.Popen(server_cmd)
    
    time.sleep(2)
    print("\n[+] Server is live!")
    print("[+] Dashboard: http://localhost:8000")
    print("[+] API Docs:  http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server.")

    webbrowser.open("http://localhost:8000")

    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\nStopping server...")
        proc.terminate()

if __name__ == "__main__":
    main()

