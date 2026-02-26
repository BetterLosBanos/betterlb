#!/usr/bin/env python3

"""
Kapwa Semantic Token Migration Script for BetterLB

This script replaces your existing color/spacing tokens with Kapwa semantic tokens.
Prioritizes semantic tokens over raw color values for better maintainability.

Usage:
    python scripts/migrate_to_kapwa_semantic.py [--dry-run]

Options:
    --dry-run    Show what would be changed without modifying files
"""

import re
import sys
import os
from pathlib import Path
from collections import defaultdict

def main():
    # Check for dry-run mode
    is_dry_run = '--dry-run' in sys.argv
    
    print('🎨 Kapwa Semantic Token Migration Tool')
    print('======================================\n')
    
    if is_dry_run:
        print('🔍 DRY RUN MODE - No files will be modified\n')
    
    # COMPREHENSIVE SEMANTIC REPLACEMENT MAPPINGS
    # Priority: Semantic tokens > Raw color tokens
    replacements = {
        # ============================================
        # SEMANTIC TEXT COLORS (Highest Priority)
        # ============================================
        
        # Main text hierarchy
        r'text-gray-900\b': 'kapwa-text-strong',
        r'text-gray-950\b': 'kapwa-text-strong',
        r'text-slate-900\b': 'kapwa-text-strong',
        r'text-slate-950\b': 'kapwa-text-strong',
        r'text-black\b': 'kapwa-text-strong',
        
        r'text-gray-700\b': 'kapwa-text-support',
        r'text-slate-700\b': 'kapwa-text-support',
        r'text-gray-800\b': 'kapwa-text-support',
        
        r'text-gray-500\b': 'kapwa-text-disabled',
        r'text-gray-400\b': 'kapwa-text-disabled',
        r'text-slate-500\b': 'kapwa-text-disabled',
        r'text-slate-400\b': 'kapwa-text-disabled',
        
        r'text-gray-600\b': 'kapwa-text-on-disabled',
        r'text-slate-600\b': 'kapwa-text-on-disabled',
        
        r'text-white\b': 'kapwa-text-inverse',
        
        # Links (replace before generic blue)
        r'text-blue-500\b': 'kapwa-text-link',
        r'text-blue-600\b': 'kapwa-text-link',
        r'text-primary-500\b': 'kapwa-text-link',
        
        # Brand text
        r'text-primary-600\b': 'kapwa-text-brand',
        r'text-brand-600\b': 'kapwa-text-brand',
        r'text-brand-700\b': 'kapwa-text-brand',
        r'text-primary-700\b': 'kapwa-text-brand',
        
        r'text-brand-800\b': 'kapwa-text-brand-bold',
        r'text-brand-900\b': 'kapwa-text-brand-bold',
        r'text-brand-950\b': 'kapwa-text-brand-bold',
        r'text-primary-800\b': 'kapwa-text-brand-bold',
        r'text-primary-900\b': 'kapwa-text-brand-bold',
        
        # Status text
        r'text-green-600\b': 'kapwa-text-success',
        r'text-green-700\b': 'kapwa-text-success',
        r'text-success-600\b': 'kapwa-text-success',
        
        r'text-red-600\b': 'kapwa-text-danger',
        r'text-red-700\b': 'kapwa-text-danger',
        r'text-error-600\b': 'kapwa-text-danger',
        r'text-error-700\b': 'kapwa-text-danger',
        
        r'text-orange-600\b': 'kapwa-text-warning',
        r'text-yellow-600\b': 'kapwa-text-warning',
        r'text-warning-600\b': 'kapwa-text-warning',
        r'text-orange-700\b': 'kapwa-text-warning',
        
        r'text-blue-600\b': 'kapwa-text-info',
        r'text-blue-700\b': 'kapwa-text-info',
        
        # Accent text
        r'text-purple-600\b': 'kapwa-text-accent-purple',
        r'text-purple-700\b': 'kapwa-text-accent-purple',
        
        # ============================================
        # SEMANTIC BACKGROUND COLORS
        # ============================================
        
        # Surface backgrounds
        r'bg-white\b': 'kapwa-bg-surface',
        r'bg-gray-50\b': 'kapwa-bg-surface-raised',
        r'bg-slate-50\b': 'kapwa-bg-surface-raised',
        r'bg-neutral-50\b': 'kapwa-bg-surface',
        
        r'bg-gray-950\b': 'kapwa-bg-surface-bold',
        r'bg-slate-950\b': 'kapwa-bg-surface-bold',
        r'bg-black\b': 'kapwa-bg-surface-bold',
        
        # Brand surfaces
        r'bg-brand-50\b': 'kapwa-bg-surface-brand',
        r'bg-brand-100\b': 'kapwa-bg-surface-brand',
        r'bg-primary-50\b': 'kapwa-bg-surface-brand',
        r'bg-primary-100\b': 'kapwa-bg-surface-brand',
        r'bg-blue-50\b': 'kapwa-bg-surface-brand',
        
        # Interactive states
        r'bg-gray-100\b': 'kapwa-bg-hover',
        r'bg-neutral-100\b': 'kapwa-bg-hover',
        r'bg-slate-100\b': 'kapwa-bg-hover',
        
        r'bg-gray-200\b': 'kapwa-bg-active',
        r'bg-neutral-200\b': 'kapwa-bg-active',
        r'bg-slate-200\b': 'kapwa-bg-active',
        
        r'bg-gray-300\b': 'kapwa-bg-disabled',
        r'bg-neutral-300\b': 'kapwa-bg-disabled',
        r'bg-slate-300\b': 'kapwa-bg-disabled',
        
        # Brand buttons/interactive elements
        r'bg-kapwa-bg-brand-default\b': 'kapwa-bg-brand-default',
        r'bg-brand-600\b': 'kapwa-bg-brand-default',
        r'bg-blue-600\b': 'kapwa-bg-brand-default',
        
        r'bg-primary-700\b': 'kapwa-bg-brand-hover',
        r'bg-brand-700\b': 'kapwa-bg-brand-hover',
        r'bg-blue-700\b': 'kapwa-bg-brand-hover',
        
        r'bg-primary-800\b': 'kapwa-bg-brand-active',
        r'bg-brand-800\b': 'kapwa-bg-brand-active',
        r'bg-blue-800\b': 'kapwa-bg-brand-active',
        
        # ============================================
        # STATUS BACKGROUNDS - SUCCESS
        # ============================================
        r'bg-green-600\b': 'kapwa-bg-success-default',
        r'bg-success-600\b': 'kapwa-bg-success-default',
        
        r'bg-green-700\b': 'kapwa-bg-success-hover',
        r'bg-success-700\b': 'kapwa-bg-success-hover',
        
        r'bg-green-800\b': 'kapwa-bg-success-active',
        r'bg-success-800\b': 'kapwa-bg-success-active',
        
        r'bg-green-50\b': 'kapwa-bg-success-weak',
        r'bg-green-100\b': 'kapwa-bg-success-weak',
        r'bg-success-50\b': 'kapwa-bg-success-weak',
        r'bg-success-100\b': 'kapwa-bg-success-weak',
        
        # ============================================
        # STATUS BACKGROUNDS - DANGER/ERROR
        # ============================================
        r'bg-red-700\b': 'kapwa-bg-danger-default',
        r'bg-red-600\b': 'kapwa-bg-danger-default',
        r'bg-error-700\b': 'kapwa-bg-danger-default',
        r'bg-error-600\b': 'kapwa-bg-danger-default',
        
        r'bg-red-800\b': 'kapwa-bg-danger-hover',
        r'bg-error-800\b': 'kapwa-bg-danger-hover',
        
        r'bg-red-900\b': 'kapwa-bg-danger-active',
        r'bg-error-900\b': 'kapwa-bg-danger-active',
        
        r'bg-red-50\b': 'kapwa-bg-danger-weak',
        r'bg-red-100\b': 'kapwa-bg-danger-weak',
        r'bg-error-50\b': 'kapwa-bg-danger-weak',
        r'bg-error-100\b': 'kapwa-bg-danger-weak',
        
        # ============================================
        # STATUS BACKGROUNDS - WARNING
        # ============================================
        r'bg-orange-600\b': 'kapwa-bg-warning-default',
        r'bg-yellow-600\b': 'kapwa-bg-warning-default',
        r'bg-warning-600\b': 'kapwa-bg-warning-default',
        
        r'bg-orange-700\b': 'kapwa-bg-warning-hover',
        r'bg-yellow-700\b': 'kapwa-bg-warning-hover',
        r'bg-warning-700\b': 'kapwa-bg-warning-hover',
        
        r'bg-orange-800\b': 'kapwa-bg-warning-active',
        r'bg-yellow-800\b': 'kapwa-bg-warning-active',
        r'bg-warning-800\b': 'kapwa-bg-warning-active',
        
        r'bg-orange-50\b': 'kapwa-bg-warning-weak',
        r'bg-orange-100\b': 'kapwa-bg-warning-weak',
        r'bg-yellow-50\b': 'kapwa-bg-warning-weak',
        r'bg-yellow-100\b': 'kapwa-bg-warning-weak',
        r'bg-warning-50\b': 'kapwa-bg-warning-weak',
        r'bg-warning-100\b': 'kapwa-bg-warning-weak',
        
        # ============================================
        # STATUS BACKGROUNDS - INFO
        # ============================================
        r'bg-blue-600\b': 'kapwa-bg-info-default',
        r'bg-blue-700\b': 'kapwa-bg-info-hover',
        r'bg-blue-800\b': 'kapwa-bg-info-active',
        r'bg-blue-50\b': 'kapwa-bg-info-weak',
        r'bg-blue-100\b': 'kapwa-bg-info-weak',
        
        # ============================================
        # SEMANTIC BORDER COLORS
        # ============================================
        
        # Default borders
        r'border-gray-100\b': 'kapwa-border-weak',
        r'border-gray-200\b': 'kapwa-border-weak',
        r'border-slate-100\b': 'kapwa-border-weak',
        r'border-slate-200\b': 'kapwa-border-weak',
        
        r'border-gray-300\b': 'kapwa-border-weak',
        r'border-gray-400\b': 'kapwa-border-strong',
        r'border-gray-500\b': 'kapwa-border-strong',
        r'border-slate-300\b': 'kapwa-border-weak',
        r'border-slate-400\b': 'kapwa-border-strong',
        
        # Brand borders
        r'border-primary-100\b': 'kapwa-border-brand',
        r'border-primary-200\b': 'kapwa-border-brand',
        r'border-primary-300\b': 'kapwa-border-brand',
        r'border-primary-500\b': 'kapwa-border-brand',
        r'border-primary-600\b': 'kapwa-border-brand',
        r'border-brand-200\b': 'kapwa-border-brand',
        r'border-brand-500\b': 'kapwa-border-brand',
        r'border-brand-600\b': 'kapwa-border-brand',
        r'border-blue-500\b': 'kapwa-border-focus',
        
        # Status borders
        r'border-green-600\b': 'kapwa-border-success',
        r'border-success-600\b': 'kapwa-border-success',
        
        r'border-red-600\b': 'kapwa-border-danger',
        r'border-red-700\b': 'kapwa-border-danger',
        r'border-error-600\b': 'kapwa-border-danger',
        r'border-error-700\b': 'kapwa-border-danger',
        
        r'border-orange-600\b': 'kapwa-border-warning',
        r'border-yellow-600\b': 'kapwa-border-warning',
        r'border-warning-600\b': 'kapwa-border-warning',
        
        r'border-blue-600\b': 'kapwa-border-info',
        
        # ============================================
        # SHADOWS
        # ============================================
        r'shadow-xs\b': 'shadow-xs',
        r'shadow-sm\b': 'shadow-sm',
        r'shadow-md\b': 'shadow-md',
        r'shadow-lg\b': 'shadow-lg',
        r'shadow(?!-)': 'shadow-base',  # Match 'shadow' without a hyphen after
        
        # ============================================
        # RAW COLOR TOKENS (Lower priority - only if not semantic)
        # ============================================
        
        # Brand colors (for cases where semantic doesn't fit)
        r'bg-primary-200\b': 'kapwa-bg-brand-200',
        r'bg-primary-300\b': 'kapwa-bg-brand-300',
        r'bg-primary-400\b': 'kapwa-bg-brand-400',
        r'bg-brand-200\b': 'kapwa-bg-brand-200',
        r'bg-brand-300\b': 'kapwa-bg-brand-300',
        r'bg-brand-400\b': 'kapwa-bg-brand-400',
        
        r'text-primary-200\b': 'kapwa-text-brand-600',
        r'text-primary-300\b': 'kapwa-text-brand-600',
        r'text-primary-400\b': 'kapwa-text-brand-600',
        
        # Gray backgrounds (for specific shades needed)
        r'bg-gray-400\b': 'kapwa-bg-gray-400',
        r'bg-gray-500\b': 'kapwa-bg-gray-500',
        r'bg-gray-600\b': 'kapwa-bg-gray-600',
        r'bg-gray-700\b': 'kapwa-bg-gray-700',
        r'bg-gray-800\b': 'kapwa-bg-gray-800',
        r'bg-gray-900\b': 'kapwa-bg-gray-900',
    }
    
    # Find all relevant files
    src_path = Path('src')
    if not src_path.exists():
        print('❌ Error: src/ directory not found!')
        print('   Make sure you are running this script from your project root.')
        sys.exit(1)
    
    file_patterns = ['**/*.ts', '**/*.tsx', '**/*.jsx', '**/*.js']
    files = []
    
    for pattern in file_patterns:
        files.extend(src_path.glob(pattern))
    
    # Filter out test files
    files = [f for f in files if '.test.' not in str(f) and '.spec.' not in str(f)]
    
    print(f'Found {len(files)} files to process\n')
    
    files_modified = 0
    total_replacements = 0
    replacement_counts = defaultdict(int)
    file_details = []
    
    # Process each file
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'⚠️  Could not read {file_path}: {e}')
            continue
        
        original_content = content
        file_replacements = 0
        replacements_in_file = []
        
        for old_pattern, new_class in replacements.items():
            # Create patterns that match the class in className strings and variants
            patterns = [
                # Standard className
                (rf'(className=["\'\`][^"\'\`]*\s){old_pattern}', rf'\1{new_class}'),
                # Hover variants
                (rf'(hover:){old_pattern}', rf'\1{new_class}'),
                # Focus variants
                (rf'(focus:){old_pattern}', rf'\1{new_class}'),
                # Active variants
                (rf'(active:){old_pattern}', rf'\1{new_class}'),
                # Dark mode variants
                (rf'(dark:){old_pattern}', rf'\1{new_class}'),
                # Group hover
                (rf'(group-hover:){old_pattern}', rf'\1{new_class}'),
            ]
            
            for pattern, replacement in patterns:
                matches = list(re.finditer(pattern, content))
                if matches:
                    content = re.sub(pattern, replacement, content)
                    count = len(matches)
                    file_replacements += count
                    replacement_counts[old_pattern] += count
                    replacements_in_file.append(f'{old_pattern} → {new_class} ({count}x)')
        
        if content != original_content:
            if not is_dry_run:
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'✓ {file_path}')
                except Exception as e:
                    print(f'⚠️  Could not write {file_path}: {e}')
                    continue
            else:
                print(f'[DRY RUN] {file_path}')
            
            print(f'  └─ {file_replacements} replacements')
            for r in replacements_in_file[:3]:
                print(f'     • {r}')
            if len(replacements_in_file) > 3:
                print(f'     ... and {len(replacements_in_file) - 3} more')
            print()
            
            files_modified += 1
            total_replacements += file_replacements
            file_details.append({'file': str(file_path), 'count': file_replacements})
    
    # Print summary
    print('\n=====================================')
    print('Migration Summary')
    print('=====================================\n')
    
    if is_dry_run:
        print('⚠️  DRY RUN - No files were actually modified\n')
    
    print(f'Files processed: {len(files)}')
    print(f'Files {"to be " if is_dry_run else ""}modified: {files_modified}')
    print(f'Total replacements: {total_replacements}\n')
    
    if replacement_counts:
        print('Top 15 replacements:')
        sorted_replacements = sorted(replacement_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        
        for old_class, count in sorted_replacements:
            new_class = replacements[old_class]
            print(f'  {old_class:<25} → {new_class:<30} ({count}x)')
    
    if file_details:
        print('\n\nTop 10 files by changes:')
        sorted_files = sorted(file_details, key=lambda x: x['count'], reverse=True)[:10]
        
        for detail in sorted_files:
            print(f'  {detail["file"]:<60} ({detail["count"]} changes)')
    
    print('\n=====================================')
    
    if is_dry_run:
        print('\n📋 To apply these changes, run:')
        print('  python scripts/migrate_to_kapwa_semantic.py\n')
        print('💡 Review the changes above and adjust the script if needed.')
    else:
        print('\n✅ Migration complete!\n')
        print('📋 Next steps:')
        print('1. Review changes: git diff')
        print('2. Test the application: npm run dev')
        print('3. Check for any visual regressions')
        print('4. Commit changes: git add . && git commit -m "Migrate to Kapwa semantic tokens"')
        print('\n💡 Remember to also update your CSS file to remove old custom color tokens!')
    
    print()

if __name__ == '__main__':
    main()
