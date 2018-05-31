import { Component } from 'preact';
import { translate } from 'react-i18next';

import { apiPost } from '../../utils/request';
import { PasswordRepeatInput } from '../../components/password';
import { Button } from '../../components/forms';
import Message from '../../components/message/message';
import { BitBox, Shift } from '../../components/icon/logo';
import Footer from '../../components/footer/footer';
import Spinner from '../../components/spinner/Spinner';
import style from './device.css';

const stateEnum = Object.freeze({
    DEFAULT: 'default',
    WAITING: 'waiting',
    ERROR: 'error'
});

@translate()
export default class Initialize extends Component {
    state = {
        password: null,
        status: stateEnum.DEFAULT,
        errorCode: null,
        errorMessage: ''
    }

    handleSubmit = event => {
        event.preventDefault();
        if (!this.state.password) {
            return;
        }
        this.setState({
            status: stateEnum.WAITING,
            errorCode: null,
            errorMessage: ''
        });
        apiPost('devices/' + this.props.deviceID + '/set-password', {
            password: this.state.password
        }).then(data => {
            if (!data.success) {
                if (data.code) {
                    this.setState({ errorCode: data.code });
                }
                this.setState({
                    status: stateEnum.ERROR,
                    errorMessage: data.errorMessage
                });
            }
            if (this.passwordInput) {
                this.passwordInput.clear();
            }
        });
    };

    setValidPassword = password => {
        this.setState({ password });
    }

    render({ t }, {
        password,
        status,
        errorCode,
        errorMessage
    }) {

        let formSubmissionState = null;

        switch (status) {
        case stateEnum.DEFAULT:
            formSubmissionState = <Message>{t('initialize.description')}</Message>;
            break;
        case stateEnum.WAITING:
            formSubmissionState = <Message type="info">{t('initialize.creating')}</Message>;
            break;
        case stateEnum.ERROR:
            formSubmissionState = (
                <Message type="error">
                    {t(`dbb.error.${errorCode}`, {
                        defaultValue: errorMessage
                    })}
                </Message>
            );
        }

        return (
            <div className={style.container}>
                <BitBox />
                <div className={style.content}>
                    {formSubmissionState}
                    <form onSubmit={this.handleSubmit}>
                        <PasswordRepeatInput
                            pattern="^[0-9]+$"
                            title={t('initialize.invalid')}
                            label="PIN"
                            repeatLabel="Repeat PIN"
                            repeatPlaceholder="Please confirm PIN"
                            ref={ref => this.passwordInput = ref}
                            disabled={status === stateEnum.WAITING}
                            onValidPassword={this.setValidPassword} />
                        <div>
                            <Button
                                type="submit"
                                primary
                                disabled={!password || status === stateEnum.WAITING}>
                                {t('initialize.create')}
                            </Button>
                        </div>
                    </form>
                    <hr />
                    <Footer>
                        <Shift style="max-width: 100px; margin: auto auto auto 0;" />
                    </Footer>
                </div>
                {
                    status === stateEnum.WAITING && (
                        <Spinner />
                    )
                }
            </div>
        );
    }
}
