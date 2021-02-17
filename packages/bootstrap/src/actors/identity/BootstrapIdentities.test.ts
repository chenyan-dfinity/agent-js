import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import {
  BootstrapChangeIdentityCommand,
  BootstrapChangeIdentityCommandIdentifier,
  Ed25519KeyIdentity,
} from '@dfinity/authentication';
import { EventIterable } from '../../dom-events';
import { ChangeCommandEventIdentities, ChangeCommandIdentity } from './BootstrapIdentities';

function SampleChangeIdentityCommand() {
  const command1: BootstrapChangeIdentityCommand = {
    type: 'https://internetcomputer.org/ns/dfinity/bootstrap/ChangeIdentityCommand',
    detail: {
      authenticationResponse:
        'http://localhost:8000/?canisterId=rrkah-fqaaa-aaaaa-aaaaq-cai&access_token=7b2264656c65676174696f6e73223a5b7b2264656c65676174696f6e223a7b2265787069726174696f6e223a2231363631353131643364616430393830222c227075626b6579223a2233303261333030353036303332623635373030333231303030343433303064343038343432386433323266336432313932303762643930356365613139613931336236653832376432656565313666383161393137353161222c2274617267657473223a5b223030303030303030303030303030303030313031225d7d2c227369676e6174757265223a226439643966376133363937333639363736653631373437353732363535383437333034353032323130306236363833363632616136333565343066663935396566313939396261353465313132343364303638336132386461636438303331653165336239303131316330323230356361323666653164613663383164386630623665336237666633656631323637643833656332356461666534636165323137373234313938613131353037613730363336633639363536653734356636343631373436313566366137333666366537386533376232323633363836313663366336353665363736353232336132323437366436633661346335383461366336333538353636633633333335313734353935383536333036313433333136623561353737383663356133323436333036313537333937353536343236333538353735613434353936623733373234363337333733353734353033383332353937393736353737373437353635353334356135353334363133373432376136323438363634393739373534343431323232633232363336633639363536653734343537383734363536653733363936663665373332323361376237643263323236383631373336383431366336373666373236393734363836643232336132323533343834313264333233353336323232633232366637323639363736393665323233613232363837343734373037333361326632663639363436353665373436393734373932643730373236663736363936343635373232653733363436623264373436353733373432653634363636393665363937343739326536653635373437373666373236623232326332323734373937303635323233613232373736353632363137353734363836653265363736353734323237643732363137353734363836353665373436393633363137343666373235663634363137343631353832353936316335333830366532616135343837313462656337376162303962376430643261613833373731306137393435613165373239343962633361303765336430313030303030303036227d5d2c227075626c69634b6579223a22333035653330306330363061326230363031303430313833623834333031303130333465303061353031303230333236323030313231353832306538626464303939333365383130313962346163626531373330316163366363643066356462386464383932323637656531386236323065363033626561363332323538323039623132356366316232663233616234323739366131656538383333366461653234346436643830353866336331393264316661373962316430356666343733227d&expires_in=10000000&token_type=bearer&scope=rwlgt-iiaaa-aaaaa-aaaaa-cai',
      identity: {
        sign: challenge => Ed25519KeyIdentity.generate().sign(challenge),
      },
    },
  };
  return command1;
}

test('BootstrapIdentities', async () => {
  const command1: BootstrapChangeIdentityCommand = SampleChangeIdentityCommand();
  const changeCommands: BootstrapChangeIdentityCommand[] = [command1];
  const identities = changeCommands.map(ChangeCommandIdentity);
  expect(identities.length).toEqual(1);
  const identity1 = identities[0];
  expect(identity1.getPublicKey().toDer().toString('hex')).toEqual(
    '305e300c060a2b0601040183b8430101034e00a5010203262001215820e8bdd09933e81019b4acbe17301ac6ccd0f5db8dd892267ee18b620e603bea632258209b125cf1b2f23ab42796a1ee88336dae244d6d8058f3c192d1fa79b1d05ff473',
  );
});

test('BootstrapIdentities dom-events', async () => {
  const el = document.createElement('div');
  const iteratedIdentities: Array<AnonymousIdentity | SignIdentity> = [];
  const identities = ChangeCommandEventIdentities(
    EventIterable(el, BootstrapChangeIdentityCommandIdentifier),
  );
  (async () => {
    for await (const i of identities) {
      iteratedIdentities.push(i);
    }
  })();
  const changeCommand: BootstrapChangeIdentityCommand = SampleChangeIdentityCommand();
  el.dispatchEvent(
    new CustomEvent(changeCommand.type, {
      detail: changeCommand.detail,
      bubbles: true,
      composed: true,
    }),
  );
  await new Promise(setImmediate);
  expect(iteratedIdentities.length).toEqual(1);
});