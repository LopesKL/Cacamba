import axios from 'axios';
import { notification } from 'antd';
import { project } from '../hooks/auth';

const Api = axios.create({
    baseURL: 'https://localhost:49828/',
    //baseURL: 'https://tekannstandardapi-dfc5a0e7ewbmamdc.eastus2-01.azurewebsites.net/'
});

export const useExceptionNotification = () => {

    const exceptionNotificationAPI = (error) => {
        if (/500/.test(error.message)) {
            notification.error({
                message: 'Erro 500',
                description: 'Failed to connect Web Service (500).',
                placement: 'bottomRight',
                duration: 9,
            });
        } else if (/404/.test(error.message)) {
            notification.error({
                message: 'Erro 404',
                description: 'Rota não encontrada (404).',
                placement: 'bottomRight',
                duration: 9,
            });
        } else if (/401/.test(error.message)) {
            sessionStorage.clear();
            localStorage.removeItem(`${project}:token`);
            localStorage.removeItem(`${project}:user`);
            localStorage.removeItem(`${project}:userName`);

            window.location.href = window.location.origin + '/signIn';
        } else if (/400/.test(error.message)) {
            let notifications = error.response.data.notifications;
            if (notifications && notifications.length > 0) {
                notifications.forEach((not) => {
                    notification.error({
                        message: 'Erro',
                        description: not.message,
                        placement: 'bottomRight',
                        duration: 9,
                    });
                });
            }
        } else {
            notification.error({
                message: 'Erro',
                description: error.message,
                placement: 'bottomRight',
                duration: 9,
            });
        }
    }

    return exceptionNotificationAPI;
}

export default Api;
