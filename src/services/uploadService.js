import { ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";
import { storage, auth } from "./firebase";

export const uploadFile = async (file, onProgress) => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  const storageRef = ref(storage, `uploads/${auth.currentUser.uid}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ name: file.name, url: downloadURL });
        } catch (error) {
          console.error('Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
};

export const uploadFromUrl = async (url, fileName, onProgress) => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return uploadFile(new File([blob], fileName), onProgress);
  } catch (error) {
    console.error('Error uploading from URL:', error);
    throw error;
  }
};
export const getFileList = async () => {
  if (!auth.currentUser) {
    console.error("User not authenticated");
    throw new Error("User not authenticated");
  }

  const listRef = ref(storage, `uploads/${auth.currentUser.uid}/`);
  console.log("Listing files for user:", auth.currentUser.uid);
  
  try {
    const res = await listAll(listRef);
    console.log("listAll response:", res);
    
    const files = await Promise.all(res.items.map(async (itemRef) => {
      try {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      } catch (error) {
        console.error("Error getting download URL for item:", itemRef.name, error);
        return null;
      }
    }));
    
    return files.filter(file => file !== null);
  } catch (error) {
    console.error('Error getting file list:', error);
    if (error.code === 'storage/unknown') {
      console.error('Firebase app config:', JSON.stringify(storage.app.options, null, 2));
    }
    throw error;
  }
};

export const deleteFile = async (fileName) => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  const fileRef = ref(storage, `uploads/${auth.currentUser.uid}/${fileName}`);
  
  try {
    await deleteObject(fileRef);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
