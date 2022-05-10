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

           
            });

        return promise;
    }

} 