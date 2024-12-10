// src/pages/AuthorizeYourself.js
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitRequest } from "@/api-client";

function AuthorizeYourself() {
  const [dataSource, setDataSource] = useState<string>();
  const [category, setCategory] = useState<string>();
  const [profileCategory, setProfileCategory] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [file, setFile] = useState<File>();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!dataSource || !category || !profileCategory || !message || !file) {
      setError("Please fill out all fields and upload a file.");
      return;
    }
    
    try {
      const formData = {
        dataSource,
        category,
        profileCategory,
        message,
      };

      const response = await submitRequest(formData, file);
      setFileUrl(response.fileUrl);  // Set the uploaded file URL
      setError('');  // Clear any existing errors
      alert('Request submitted successfully!');
    } catch (error) {
      setError('Error submitting request. Please try again.');
    }
  };

  return (
    <div className="container px-2 grid grid-cols-4 my-4 gap-2">
      <p className="col-span-4 text-3xl font-bold">
        Authorize Yourself, <span className="text-orange-600">Get Data!</span>
      </p>
      <p className="col-span-4 text-sm mb-3">
        You need to authorize yourself to get access to the data. Please fill
        the form below to authorize yourself
      </p>
      <div>
        <p className="font-semibold text-xs mb-1">Datasource:</p>
        <Select onValueChange={setDataSource}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose Datasource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INSAT-3D">INSAT-3D</SelectItem>
            <SelectItem value="INSAT-3DR">INSAT-3DR</SelectItem>
            <SelectItem value="INSAT-3S">INSAT-3S</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="font-semibold text-xs mb-1">Category:</p>
        <Select onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IMAGER">IMAGER</SelectItem>
            <SelectItem value="SOUNDER">SOUNDER</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="font-semibold text-xs mb-1">Profile Type:</p>
        <Select onValueChange={setProfileCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose Profile Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="WORKING_PROFESSIONAL">
              Working Professional
            </SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="font-semibold text-xs mb-1">Upload Relevant ID:</p>
        <Input
          id="picture"
          type="file"
          placeholder="Upload Relevant ID"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </div>
      <div className="col-span-4">
        <Label htmlFor="message-2">Describe the message behind your need</Label>
        <Textarea
          placeholder="Type your message here."
          id="message-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Your message will be sent to the team.
        </p>
      </div>
      <Button className="mt-4" onClick={handleSubmit}>
        Submit
      </Button>
      {error && <p className="text-red-500 col-span-4 text-xs">{error}</p>}
      {fileUrl && (
        <div className=" text-xs col-span-4">
          <p>Request Submitted successfully! </p>
        </div>
      )}
    </div>
  );
}

export default AuthorizeYourself;
