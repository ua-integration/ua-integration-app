import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { MyCar } from './types';

type Response = MyCar;
type Variables = { apiURL: string; token: string };

export const useAddMyCar = createMutation<Response, Variables, AxiosError>({
  mutationFn: (variables) =>
    client.post(
      '/api/ios.php',
      {
        token: variables.token,
        cmd: '',
      },
      { baseURL: variables.apiURL },
    ),
});