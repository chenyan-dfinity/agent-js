import * as React from 'react';
import { Button } from 'src/components/Button';
import SimpleScreenLayout from '../layout/SimpleScreenLayout';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import styled from '@material-ui/core/styles/styled';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import {
  AuthenticationResponseConsentProposal,
  createSignIdentity,
} from 'src/design-phase-1/state/reducers/authentication';
import { hexEncodeUintArray } from 'src/bytes';
import { scope } from '@dfinity/authentication';

/**
 * Screen that presents the user with a decision about whether they consent
 * to a proposal to create an AuthenticationResponse with certain parameters.
 * @param props props
 * @param props.consentProposal - proposal to create a certain AuthenticationResponse
 * @param props.consent - invoke this if the end-user consents
 */
export default function (props: {
  consentProposal: AuthenticationResponseConsentProposal;
  consent(): void;
}): JSX.Element {
  const { consentProposal } = props;
  return (
    <>
      <div data-test-id='session-consent-screen'>
        <SimpleScreenLayout
          {...{
            HeroImage,
            Title,
            Body: () => <Body {...{ consentProposal }} />,
            CallToAction: () => <CallToAction consent={props.consent} />,
          }}
        />
      </div>
    </>
  );
}

const styler = function () {
  return createStyles({
    consentTable: {
      '& th,td': {
        'textAlign': 'left',
        'overflowWrap': 'anywhere',
        'wordBreak': 'break-all',
        '&:first-child': {
          fontWeight: 'bold',
          textAlign: 'right',
          overflowWrap: 'initial',
          whiteSpace: 'nowrap',
          wordBreak: 'normal',
        },
        'verticalAlign': 'top',
        'paddingRight': '1em',
        'overflow': 'hidden',
        '& ul': {
          marginTop: 'inherit',
          marginBottom: 'inherit',
          paddingLeft: 0,
          listStylePosition: 'inside',
        },
      },
    },
    wrapTextAnywhere: {
      overflowWrap: 'anywhere',
    },
  });
};

function CallToAction(props: { consent(): void }) {
  async function onClickAllow() {
    await props.consent();
  }
  return (
    <>
      <Button role='button' data-test-id='deny-authorize-session'>
        Deny
      </Button>
      <Button
        role='button'
        variant='outlined'
        color='primary'
        data-test-id='allow-authorize-session'
        onClick={onClickAllow}
      >
        Allow
      </Button>
    </>
  );
}
function Title() {
  return <>Authorize Session</>;
}

function HexFormatter(props: { hex: string }) {
  const { hex } = props;
  const numChars = props.hex.length;
  const numLines = 2;
  const firstLineLength = Math.ceil(numChars / numLines);
  const lines = [];
  for (let i = 0; i < hex.length; i += firstLineLength) {
    lines.push(hex.slice(i, i + firstLineLength));
    // encourage a line break here
    // lines.push(<wbr />)
  }
  return <>{lines}</>;
}

function Body(props: { consentProposal: AuthenticationResponseConsentProposal }) {
  const styles = makeStyles(styler)();
  const { consentProposal } = props;
  const sessionDerHex = consentProposal.request.sessionIdentity.hex;
  const signerPublicKey: ArrayBuffer = createSignIdentity(consentProposal.signer)
    .getPublicKey()
    .toDer();
  return (
    <>
      <Typography variant='subtitle1' gutterBottom>
        You have chosen to Sign In with
      </Typography>
      <Typography component='div' gutterBottom>
        <table className={styles.consentTable}>
          <tbody>
            <tr>
              <th scope='row'>Profile ID</th>
              <td>
                <HexFormatter hex={hexEncodeUintArray(new Uint8Array(signerPublicKey))} />
              </td>
            </tr>
            <tr>
              <th scope='row'>Session ID</th>
              <td>{sessionDerHex ? <HexFormatter hex={sessionDerHex} /> : '(not set)'}</td>
            </tr>
            <tr>
              <th scope='row'>Canisters</th>
              <td>
                <ul>
                  {scope
                    .parseScopeString(props.consentProposal.request.scope)
                    .map(({ principal }, i) => {
                      return <li key={i}>{principal.toText()}</li>;
                    })}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </Typography>
      <br />
      <Warning>
        <Typography>
          Do you authorize this session to act as your chosen Profile when interacting with the
          canisters?
        </Typography>
      </Warning>
    </>
  );
}

function Warning(props: { children: React.ReactNode }) {
  const StyledWarning = styled('div')({
    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    padding: '0.75em 1.25em',
    border: '1px solid transparent',
    borderRadius: '0.25em',
  });
  return <StyledWarning>{props.children}</StyledWarning>;
}

function HeroImage() {
  return (
    <>
      <EnhancedEncryptionIcon style={{ fontSize: '4em' }} />
    </>
  );
}