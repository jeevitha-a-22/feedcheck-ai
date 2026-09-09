import sys

print("Python executable:", sys.executable)
print("Python version:", sys.version)

packages = ["tensorflow", "keras", "sklearn", "PIL", "matplotlib", "pandas", "numpy", "cv2"]
for pkg in packages:
    try:
        mod = __import__(pkg)
        version = getattr(mod, "__version__", "unknown")
        print(f"  [OK] {pkg}: {version}")
    except ImportError as e:
        print(f"  [MISSING] {pkg}: {e}")
