# CM-015 PDF Assembly Environment

## Cloud Environment Configuration

**Name:** pdf-legal-builder
**Network Access:** Trusted (required for pip dependencies)

## Environment Status

### ✅ Installed Dependencies
- `pypdf` v6.4.2
- `reportlab` v4.4.6
- `cryptography` v46.0.3

### Required Environment Variable (if needed)
```bash
export PYTHONPATH=/usr/local/lib/python3.11/dist-packages:$PYTHONPATH
```

## Required Files to Upload

Before running the CM-015 grid assembly script, upload these files to this directory:

1. **Input PDF:**
   - Local path: `/Users/ericjones/Fortress/CM-015_BLANK_DEEP_THINK.pdf`
   - Cloud path: `/home/user/compass-outlaw/fortress/cm015/CM-015_BLANK_DEEP_THINK.pdf`

2. **Assembly Script:**
   - Local path: `/Users/ericjones/Fortress/cm015_grid_final.py`
   - Cloud path: `/home/user/compass-outlaw/fortress/cm015/cm015_grid_final.py`

## Running the Script

Once files are uploaded:

```bash
cd /home/user/compass-outlaw/fortress/cm015
export PYTHONPATH=/usr/local/lib/python3.11/dist-packages:$PYTHONPATH
python3 cm015_grid_final.py
```

## Output

The script will generate:
- `/home/user/compass-outlaw/fortress/cm015/CM-015_GRID_CALIBRATED.pdf`

## Path Mapping Reference

| Local (Mac)                                      | Cloud Environment                                           |
|--------------------------------------------------|-------------------------------------------------------------|
| `/Users/ericjones/Fortress/`                     | `/home/user/compass-outlaw/fortress/cm015/`                 |
| `CM-015_BLANK_DEEP_THINK.pdf`                    | `CM-015_BLANK_DEEP_THINK.pdf`                               |
| `cm015_grid_final.py`                            | `cm015_grid_final.py`                                       |
| `CM-015_GRID_CALIBRATED.pdf` (output)            | `CM-015_GRID_CALIBRATED.pdf` (output)                       |

## Verification Command

Test that the environment is ready:
```bash
PYTHONPATH=/usr/local/lib/python3.11/dist-packages:$PYTHONPATH python3 -c "import pypdf; import reportlab; print('Environment Ready!')"
```
