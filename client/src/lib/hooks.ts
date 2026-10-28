import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import api from './api';

export function useApiQuery<T>(
    key: any[],
    url: string,
    options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<T, Error>({
        queryKey: key,
        queryFn: async () => {
            const { data } = await api.get<T>(url);
            return data;
        },
        ...options,
    });
}


export function useApiMutation<TVariables = any, TData = any>(
    method: 'post' | 'put' | 'delete' | 'patch',
    baseUrl: string,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: async (variables: any) => {
            let url = baseUrl;
            let payload = variables;
            let headers = {};

            // Handle dynamic segments and headers if variables has a specific structure
            if (variables && typeof variables === 'object' && ('params' in variables || 'data' in variables || 'headers' in variables)) {
                if (variables.params) {
                    Object.keys(variables.params).forEach(key => {
                        if (url.includes(`:${key}`)) {
                            url = url.replace(`:${key}`, String(variables.params[key]));
                        } else if (key === 'id' && variables.params[key] !== undefined) {
                            url = `${url.replace(/\/$/, '')}/${variables.params[key]}`;
                        }
                    });
                }
                payload = variables.data;
                headers = variables.headers || {};
            } else if (method === 'delete' && (typeof variables === 'number' || typeof variables === 'string')) {
                if (url.includes(':id')) {
                    url = url.replace(':id', String(variables));
                } else {
                    url = `${baseUrl.replace(/\/$/, '')}/${variables}`;
                }
                payload = undefined;
            }

            const { data } = await api[method]<TData>(url, payload, { headers });
            return data;
        },
        ...options,
    });
}
