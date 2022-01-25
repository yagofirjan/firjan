import {
    SPHttpClient,
    SPHttpClientResponse,
    ISPHttpClientOptions,
    //SPHttpClientBatch
} from '@microsoft/sp-http';

import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { AadTokenProvider } from '@microsoft/sp-http';

import { IApiSwaggerListItem } from '../models';

const URL_API :string = ``;
const LIST_API_ENDPOINT: string = `/_api/web/lists/getbytitle('CadBeneficiario')`;
const SELECT_QUERY: string = '$select=ID,Nome,CPF,DataNascimento,Telefone,Parentesco,Porcentagem';
const FILTER_QUERY: string = '&$filter=(typeFilter eq MT)or(Estado eq Todas as UFs)';


export class ApiSwaggerService {

    /* Setup common headers for different requests.*/
    private _spHttpOptions: any = {
        getNoMetadata: <ISPHttpClientOptions>{
            headers: { 'ACCEPT': 'application/json; odata.metadata=none' }
        },
        getFullMetadata: <ISPHttpClientOptions>{
            headers: { 'ACCEPT': 'application/json; odata.metadata=full' }
        },
        postNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
            }
        },
        updateNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
                'X-HTTP-Method': 'MERGE'
            }
        },
        deleteNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
                'X-HTTP-Method': 'DELETE'
            }
        }
    };
    

    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }

    /**
     * Return collection of all NASA Apollo missions.
     *
     * @returns {IApiSwagger[]}      Collection of missions.
     * @memberof ApiSwaggerService
     */
    public getInfosApi(UserName: string): Promise<IApiSwaggerListItem[]> {
        let promise: Promise<IApiSwaggerListItem[]> = new Promise<IApiSwaggerListItem[]>((resolve, reject) => {

            // this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'orders');
           // this.client.get('');
            
            // this.context.aadTokenProviderFactory
            //     .getTokenProvider()
            //     .then((tokenProvider: AadTokenProvider): Promise<string> => {
            //         // retrieve access token for the enterprise API secured with Azure AD
            //         // the parameter passed into getToken()is the Application ID URI
            //         return tokenProvider.getToken('https://contoso.azurewebsites.net');
            //     })
            //     .then((accessToken: string): void => {
            //         // call the enterprise API using jQuery passing the access token
            //         $.get({
            //             url: 'https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/obterporlogin?Login='+UserName+'&IncluirEmpresa=true&IncluirEstabelecimento=true',
            //             headers: {
            //                 authorization: `Bearer ${accessToken}`,
            //                 accept: 'application/json'
            //             }
            //         })
            //             .done((orders: any): void => {

            //             });
            //     });

            // this.client.get(`https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/obterporlogin?Login=${UserName}&IncluirEmpresa=true&IncluirEstabelecimento=true`,
            //     headers: {
            //     authorization: `Bearer ${accessToken}`,
            //     accept: 'application/json'
            // }

            //     // SPHttpClient.configurations.v1,
            //     // this._spHttpOptions.getNoMetadata
            // ) // get response & parse body as JSON
            //     .then((response: SPHttpClientResponse): Promise<{ value: IApiSwaggerListItem[] }> => {
            //         return response.json();
            //     }) // get parsed response as array, and return
            //     .then((response: { value: IApiSwaggerListItem[] }) => {
            //         resolve(response.value);
            //     })
            //     .catch((error: any) => {
            //         reject(error);
            //     });
        });

        return promise;
    }

} 