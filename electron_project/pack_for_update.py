import os
import shutil
import zipfile

# Asking user if he wants to remove current package
delete_old_package = input('Delete old package? (y/n) ')

if delete_old_package == 'y':

    # Deleting old package folder if it exists
    if os.path.exists('package'):
        shutil.rmtree('package')

    # Creating new package folder
    os.mkdir('package')
    os.mkdir('package/electron_project')

# Asking user for files to be packaged
paths = []

while True:
    path = input('Path: ')

    if path:
        paths.append(path)

    else:
        break

# Creating folders and files
for path in paths:
    
    folder_names = path.split('/')
    filename = folder_names.pop()

    current_name = 'package/electron_project/'
    
    for name in folder_names:
        current_name += name

        if not os.path.exists(current_name):
            os.mkdir(current_name)
        
        current_name += '/'

    shutil.copyfile(path, current_name + filename)
    
# Zipping package
os.chdir('package')
shutil.make_archive('code', 'zip', base_dir='electron_project')

while True:
    input('Done. Press Enter to Exit.')
    break
