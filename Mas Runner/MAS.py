import os
import signal
from subprocess import Popen, call, CREATE_NEW_PROCESS_GROUP
import sys

import time

p1 = Popen(['python', 'electron_project\manage.py', 'runserver'], shell=True, creationflags=CREATE_NEW_PROCESS_GROUP)
p2 = Popen(['Mas Electronics.exe',])

while True:
    
    if p2.poll() is not None:
                
        call(['powershell', 'Stop-Process', '-Name', '"python"', '-Force'], shell=True)
        break
