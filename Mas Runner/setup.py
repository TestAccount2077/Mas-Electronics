from cx_Freeze import setup, Executable
import sys

base = None

if sys.platform == 'win32':
    base = 'Win32GUI'

setup(name='MAS',
      version='0.1',
      executables=[Executable('MAS.py', base=base, icon='edit.ico')]
)




# Then Run the appropriate command:

# python setup.py build
# python setup.py bdist_msi
