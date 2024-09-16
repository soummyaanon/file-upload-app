import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5173/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

export const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const uploadFileToDrive = async (file, accessToken) => {
  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const fileMetadata = {
    name: file.name,
  };

  const media = {
    mimeType: file.type,
    body: file,
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return {
      id: response.data.id,
      url: response.data.webViewLink,
      name: file.name,
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};