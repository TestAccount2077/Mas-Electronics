import os, httplib2

from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
from zipfile import ZipFile
from subprocess import Popen


class UploadHandler(object):
    
    errors = {}
    filename = 'electron_project/db.sqlite3'
    
    def __init__(self):
        
        flags = None
            
        SCOPES = 'https://www.googleapis.com/auth/drive.file'
        store = file.Storage('electron_project/storage.json')
        creds = store.get()
        
        if not creds or creds.invalid:
            
            flow = client.flow_from_clientsecrets(
                'electron_project/client_secret.json', scope=SCOPES
            )
            
            if flags:
                creds = tools.run_flow(flow, store, flags)
            else:
                creds = tools.run(flow, store)
        try:
            self.DRIVE = build('drive', 'v3', http=creds.authorize(Http()))
            self.pack_file()
            
        except httplib2.ServerNotFoundError:
            self.errors['disconnected'] = 'لا يتوفر اتصال بالانترنت'
            
    def pack_file(self):
        
        with ZipFile('new data.zip', 'w') as file:
            file.write(self.filename)
        
        self.send_file()
    
    def send_file(self):
        
        metadata = {
            'name': 'new data.zip',
            'mimeType': 'application/x-zip-compressed'
        }
        
        res = self.DRIVE.files().update(
            body=metadata,
            media_body='new data.zip',
            fileId='1GZN0-gyu8OVumCsxVNgF2OLLFpSteEVT',
            keepRevisionForever=True
        ).execute()
        
        
class DownloadHandler(object):
    
    errors = {}
    
    def __init__(self):
        
        flags = None
        
        SCOPES = 'https://www.googleapis.com/auth/drive.file'
        store = file.Storage('electron_project/storage.json')
        creds = store.get()

        if not creds or creds.invalid:
            
            flow = client.flow_from_clientsecrets(
                'electron_project/client_secret.json', scope=SCOPES
            )

            if flags:
                creds = tools.run_flow(flow, store, flags)
            else:
                creds = tools.run(flow, store)
        
        try:
            self.DRIVE = build('drive', 'v3', http=creds.authorize(Http()))
            self.download_and_extract()
        
        except httplib2.ServerNotFoundError:
            self.errors['disconnected'] = 'لا يتوفر اتصال بالانترنت'
    
    def download_and_extract(self):
        
        data = self.DRIVE.files().get_media(fileId='1GZN0-gyu8OVumCsxVNgF2OLLFpSteEVT').execute()
        filename = 'new data.zip'
        
        if data:
            fn = '%s.zip' % os.path.splitext(filename)[0]
            
            if data:
                with open(fn, 'wb') as fh:
                    fh.write(data)
                    
                with ZipFile('new data.zip', 'r') as file:
                    file.extractall('.')
                    
                os.remove('new data.zip')

class UpdateHandler(object):
    
    errors = {}
    
    def __init__(self):
        
        flags = None
        
        SCOPES = 'https://www.googleapis.com/auth/drive.file'
        store = file.Storage('electron_project/storage.json')
        creds = store.get()

        if not creds or creds.invalid:
            
            flow = client.flow_from_clientsecrets(
                'electron_project/client_secret.json', scope=SCOPES
            )

            if flags:
                creds = tools.run_flow(flow, store, flags)
            else:
                creds = tools.run(flow, store)
        
        try:
            self.DRIVE = build('drive', 'v3', http=creds.authorize(Http()))
            self.download_and_extract()
        
        except httplib2.ServerNotFoundError:
            self.errors['disconnected'] = 'لا يتوفر اتصال بالانترنت'
    
    def download_and_extract(self):
        
        data = self.DRIVE.files().get_media(fileId='1Dsx3Ho65qUvluA98n-eUoYrjCznrg-LG').execute()
        filename = 'code.zip'
        
        if data:
            fn = '%s.zip' % os.path.splitext(filename)[0]
            
            if data:
                with open(fn, 'wb') as fh:
                    fh.write(data)
                    
                with ZipFile('code.zip', 'r') as file:
                    file.extractall('.')
                    
                os.remove('code.zip')
                
        self.run_migration_commands()
                
    def run_migration_commands(self):
        
        Popen(['python', 'electron_project/manage.py', 'migrate'], shell=True)
