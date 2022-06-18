import 'bootstrap';
import { SPHttpClient} from '@microsoft/sp-http';
import { UserAgentApplication, AuthenticationParameters, Configuration } from "@azure/msal";
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class ObterTokenAPIComponent {
    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }

    public async GetToken() {

      const config: Configuration = {
        auth: {
          clientId: '09a83055-95fc-4dfc-adc5-64fb8a6d9228',
          authority: 'https://login.microsoftonline.com/d0c698d4-e4ea-4ee9-a79d-f2d7a78399c8/oauth2/v2.0/authorize',
          redirectUri: 'https://sfirjan.sharepoint.com/sites/DEV/SitePages/Developer.aspx',
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false
        },
      };
  
      const params: AuthenticationParameters = {
        authority: 'https://login.microsoftonline.com/d0c698d4-e4ea-4ee9-a79d-f2d7a78399c8',
        scopes: ['api://09a83055-95fc-4dfc-adc5-64fb8a6d9228/Colaborador.Read.All', 'api://09a83055-95fc-4dfc-adc5-64fb8a6d9228/Beneficios.ReadWrite.All'],
      };
  
      const myMSAL = new UserAgentApplication(config);
  
      try {
  
        const login = await myMSAL.acquireTokenSilent(params);
        return login.accessToken;
  
  
      } catch (error) {
  
        await myMSAL.loginPopup(params);
        const login = await myMSAL.acquireTokenSilent(params);
        return (error);
  
      }
  
    }
}
