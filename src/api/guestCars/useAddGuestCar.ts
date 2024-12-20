import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Response = void;
type Variables = {
  apiURL: string;
  token: string;
  payload: {
    carNumber: string;
    hours: number;
  };
};

export const useAddGuestCar = createMutation<Response, Variables, AxiosError>({
  mutationFn: (variables) =>
    client
      .post(
        '/api/ios.php',
        {
          token: variables.token,
          cmd: 'cmd_edit_invite',
          id_invite: 0,
          p_car_num: variables.payload.carNumber,
          p_hours: variables.payload.hours,
        },
        { baseURL: variables.apiURL },
      )
      .then((response) => response.data?.cmd_result || [])
      .then((response) => response[0])
      .then((response) => {
        if (response.result === 'error') {
          throw new Error('car_number_exists');
        }
      }),
});
