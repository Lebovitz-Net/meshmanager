import os
import re
import shutil
import argparse
from pathlib import Path
from collections import defaultdict

# Regex to match import statements
IMPORT_REGEX = re.compile(r'(import\s+(?:[^"\']+\s+from\s+)?[\'"])([^\'"]+)([\'"])')

def build_file_dict(root_folder):
    file_map = defaultdict(list)
    for dirpath, _, filenames in os.walk(Path(root_folder).resolve()):
        for fname in filenames:
            full_path = Path(dirpath) / fname
            rel_path = full_path.relative_to(Path.cwd())
            file_map[fname].append(rel_path)
    return file_map

def apply_rewrites(root_folder, file_dict, dry_run=True):
    for dirpath, _, filenames in os.walk(Path(root_folder).resolve()):
        for fname in filenames:
            if fname.endswith('.js'):
                file_path = Path(dirpath) / fname
                rel_source = file_path.relative_to(Path.cwd())
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    changed = False

                    def replacer(match):
                        nonlocal changed
                        prefix, imp, suffix = match.groups()
                        imp_path = Path(imp)
                        imp_base = imp_path.name

                        # Rule 2: Assume .js if no extension
                        if '.' not in imp_base:
                            imp_base += '.js'

                        candidates = file_dict.get(imp_base)
                        if not candidates:
                            print(f"❌ File not found: {imp_base} in {rel_source}")
                            return match.group(0)

                        rel_path = candidates[0].parent
                        ext = Path(imp_base).suffix
                        new_name = Path(imp_base).stem if ext == '.js' else imp_base
                        new_path = f"@/{rel_path}/{new_name}".replace("\\", "/")

                        print(f"🔁 {imp} → {new_path}")
                        changed = True
                        return f"{prefix}{new_path}{suffix}"

                    new_content = IMPORT_REGEX.sub(replacer, content)

                    if changed:
                        if dry_run:
                            print(f"🧪 Dry run: {rel_source} would be modified")
                        else:
                            backup_path = file_path.with_suffix('.bkp')
                            shutil.copy(file_path, backup_path)
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"💾 Backup created: {backup_path.relative_to(Path.cwd())}")

                except Exception as e:
                    print(f"⚠️ Error processing {rel_source}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Rewrite import paths with modular aliases.")
    parser.add_argument("--folder", type=str, default="./src", help="Root folder to scan")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying files")

    args = parser.parse_args()
    file_dict = build_file_dict(args.folder)
    apply_rewrites(args.folder, file_dict, dry_run=args.dry_run)
