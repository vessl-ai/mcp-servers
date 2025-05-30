import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Tool } from '@rekog/mcp-nest';
import { OAuth2Client } from 'google-auth-library';
import { drive_v3, forms_v1, google } from 'googleapis';
import { z } from 'zod';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleFormsTool {
  private formsClient(authClient: OAuth2Client): forms_v1.Forms {
    return google.forms({ version: 'v1', auth: authClient });
  }
  private driveClient(authClient: OAuth2Client): drive_v3.Drive {
    return google.drive({ version: 'v3', auth: authClient });
  }
  private logger = new Logger(GoogleFormsTool.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Tool({
    name: 'startOauth2',
    description: 'Start OAuth2 authentication',
  })
  async startOauth2(
    params: any,
    context: Context,
    request: Request,
  ): Promise<{
    content: any[];
  }> {
    const sessionId = request['sessionId'];
    if (sessionId) {
      this.logger.log(`Session ID: ${sessionId}`);
    }
    this.logger.log('Starting OAuth2 authentication');
    const redirectUri = this.configService.get('app.oauth2CallbackUrl');

    this.logger.log(`Redirect URI: ${redirectUri}`);
    const authUrl = await this.authService.initiateOauth2(sessionId, [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/drive.file',
    ]);
    return {
      content: [
        {
          type: 'text',
          text: `Please visit this URL to authenticate: ${authUrl}`,
        },
      ],
    };
  }

  // Create a new Google Form
  @Tool({
    name: 'createForm',
    description: 'Create a new Google Form, ',
    parameters: z.object({
      info: z.object({
        title: z.string(),
        description: z.string().optional(),
        documentTitle: z.string().optional(),
      }),
      items: z.array(z.any()).optional(),
      settings: z.any().optional(),
      revisionId: z.string().optional(),
      responderUri: z.string().optional(),
      linkedSheetId: z.string().optional(),
      formId: z.string().optional(),
    }),
  })
  async createForm(
    form: forms_v1.Schema$Form,
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );

    const { info, items, settings } = form;
    this.logger.log(`Creating form with info: ${JSON.stringify(info)}`);
    this.logger.log(`Creating form with items: ${JSON.stringify(items)}`);
    this.logger.log(`Creating form with settings: ${JSON.stringify(settings)}`);
    const res = await this.formsClient(authClient).forms.create({
      requestBody: {
        info: {
          title: info?.title,
          description: info?.description,
          documentTitle: info?.documentTitle,
        },
        items: items,
        settings: settings,
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
    name: 'deleteForm',
    description: 'Delete a Google Form',
    parameters: z.object({
      formId: z.string(),
    }),
  })
  async deleteForm(
    formId: string,
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
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
  async publishForm(
    { formId }: { formId: string },
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
    const res = await this.formsClient(authClient).forms.setPublishSettings({
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
  async getForm(
    { formId }: { formId: string },
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
    const res = await this.formsClient(authClient).forms.get({ formId });
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
  async listMyForms(
    params: any,
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
    const res = await this.driveClient(authClient).files.list({
      q: "mimeType='application/vnd.google-apps.form'",
      fields:
        'nextPageToken, files(id, name, createdTime, modifiedTime, owners)',
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
  async getFormResponses(
    { formId, responseId }: { formId: string; responseId: string },
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
    const res = await this.formsClient(authClient).forms.responses.get({
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
  async listFormResponses(
    { formId }: { formId: string },
    context: Context,
    request: Request,
  ): Promise<any> {
    const authClient = await this.authService.getAuthClient(
      request['sessionId'],
    );
    const res = await this.formsClient(authClient).forms.responses.list({
      formId,
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
}
