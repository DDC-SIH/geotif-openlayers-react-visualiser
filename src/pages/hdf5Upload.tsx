import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, X } from 'lucide-react';
import { getPresignedUrl, uploadFileToS3 } from '@/api-client';

interface FileStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function MultiHDF5Upload() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.name.endsWith('.h5'));

    if (validFiles.length !== selectedFiles.length) {
      alert('Please select only valid HDF5 files (.h5 extension)');
    }

    setFiles(prevFiles => [
      ...prevFiles,
      ...validFiles.map(file => ({ file, status: 'pending' as const }))
    ]);
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        const currentFile = files[i].file;

        setFiles(prevFiles =>
          prevFiles.map((file, index) =>
            index === i ? { ...file, status: 'uploading' } : file
          )
        );

        try {
          const { url } = await getPresignedUrl(currentFile.name);
          console.log(url, currentFile)
          await uploadFileToS3(url, currentFile);

          setFiles(prevFiles =>
            prevFiles.map((file, index) =>
              index === i ? { ...file, status: 'success' } : file
            )
          );
        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prevFiles =>
            prevFiles.map((file, index) =>
              index === i ? { ...file, status: 'error' } : file
            )
          );
        }
      }
    }

    setUploading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">HDF5 File Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="hdf5-files">Select HDF5 Files</Label>
            <Input
              id="hdf5-files"
              type="file"
              accept=".h5"
              onChange={handleFileChange}
              multiple
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="truncate max-w-xs">{file.file.name}</span>
                <div className="flex items-center">
                  {file.status === 'pending' && <span className="text-gray-500">Pending</span>}
                  {file.status === 'uploading' && <span className="text-blue-500">Uploading...</span>}
                  {file.status === 'success' && <span className="text-green-500">Uploaded</span>}
                  {file.status === 'error' && <span className="text-red-500">Error</span>}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="submit"
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload HDF5 Files'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </form>
        {files.some(file => file.status === 'success') && (
          <Alert className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {files.filter(file => file.status === 'success').length} file(s) have been successfully uploaded.
            </AlertDescription>
          </Alert>
        )}
        {files.some(file => file.status === 'error') && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an error uploading {files.filter(file => file.status === 'error').length} file(s). Please try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
