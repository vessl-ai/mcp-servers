import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Tool } from '@rekog/mcp-nest';
import { OAuth2Client } from 'google-auth-library';
import { drive_v3, forms_v1, google } from 'googleapis';
import { z } from 'zod';

@Injectable()
export class GoogleFormsTool {
  private formsClient: forms_v1.Forms;
  private driveClient: drive_v3.Drive;
  private authClient: OAuth2Client;
  private logger = new Logger(GoogleFormsTool.name);
  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('google.clientId');
    const clientSecret = this.configService.get<string>('google.clientSecret');
    const redirectUri = this.configService.get('app.oauth2CallbackUrl');
    this.authClient = new OAuth2Client(clientId, clientSecret, redirectUri);
    this.formsClient = google.forms({ version: 'v1', auth: this.authClient });
    this.driveClient = google.drive({ version: 'v3', auth: this.authClient });
  }

  @Tool({
    name: 'startOauth2',
    description: 'Start OAuth2 authentication',
  })
  startOauth2(
    params: any,
    context: Context,
    request: Request,
  ): {
    content: any[];
  } {
    this.logger.log('Starting OAuth2 authentication');
    const redirectUri = this.configService.get('app.oauth2CallbackUrl');

    this.logger.log(`Redirect URI: ${redirectUri}`);
    const authUrl = this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/drive.file',
      ],
      redirect_uri: redirectUri,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Please visit this URL to authenticate: ${authUrl}`,
        },
      ],
    };
  }

  async authCallback(code: string) {
    const token = await this.authClient.getToken(code);
    this.authClient.setCredentials(token.tokens);
  }

  // Create a new Google Form
  @Tool({
    name: 'createForm',
    description: 'Create a new Google Form, ',
    parameters: z.object({
      form: z
        .string()
        .describe(
          'JSON string of the form to create - https://developers.google.com/workspace/forms/api/reference/rest/v1/forms#Info',
        ),
    }),
  })
  async createForm(form: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }

    // Why is this API so convoluted? Just let me create a form!
    const request = JSON.parse(form);
    const res = await this.formsClient.forms.create({
      requestBody: request,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }

  @Tool({
    name: 'deleteForm',
    description: 'Delete a Google Form',
    parameters: z.object({
      formId: z.string(),
    }),
  })
  async deleteForm(formId: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    throw new Error(
      'Google Forms API does NOT support deleting forms. Go yell at Google.',
    );
  }

  @Tool({
    name: 'publishForm',
    description: 'Publish a Google Form',
    parameters: z.object({
      formId: z.string(),
    }),
  })
  async publishForm(formId: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    const res = await this.formsClient.forms.setPublishSettings({
      formId,
      requestBody: {
        publishSettings: {
          publishState: {
            isPublished: true,
            isAcceptingResponses: true,
          },
        },
      },
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }

  @Tool({
    name: 'getForm',
    description: 'Get a Google Form',
    parameters: z.object({
      formId: z.string(),
    }),
  })
  async getForm(formId: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    const res = await this.formsClient.forms.get({ formId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }

  @Tool({
    name: 'listMyForms',
    description: 'List all Google Forms owned by the authenticated user',
  })
  async listMyForms(): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    const res = await this.driveClient.files.list({
      q: "mimeType='application/vnd.google-apps.form' and trashed=false",
      fields: 'files(id, name, createdTime, modifiedTime, owners)',
      spaces: 'drive',
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }

  @Tool({
    name: 'getFormResponses',
    description: 'Get responses for a Google Form',
    parameters: z.object({
      formId: z.string(),
      responseId: z.string(),
    }),
  })
  async getFormResponses(formId: string, responseId: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    const res = await this.formsClient.forms.responses.get({
      formId,
      responseId,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }
  @Tool({
    name: 'listFormResponses',
    description: 'List responses for a Google Form',
    parameters: z.object({
      formId: z.string(),
    }),
  })
  async listFormResponses(formId: string): Promise<any> {
    try {
      await this.authClient.getAccessToken();
    } catch (error) {
      throw new Error(
        'Not authenticated. Please start OAuth2 authentication first.',
      );
    }
    const res = await this.formsClient.forms.responses.list({ formId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res.data),
        },
      ],
    };
  }
}
