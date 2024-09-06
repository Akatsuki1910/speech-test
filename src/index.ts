import van from "vanjs-core";
const {
  p,
  div,
  input,
  button,
  ul,
  li,
  table,
  thead,
  tbody,
  tr,
  td,
  th,
  select,
  option,
} = van.tags;

const canUseSpeechSynthesisText =
  "speechSynthesis" in window
    ? "このブラウザは音声合成に対応しています"
    : "このブラウザは音声合成に対応していません";

const text = van.state("Hello, World!");
const canSpeech = van.state(true);

const voices = van.state<SpeechSynthesisVoice[]>([]);
const nowVoice = van.state<SpeechSynthesisVoice>({} as SpeechSynthesisVoice);

const uttr = new SpeechSynthesisUtterance("");
uttr.onend = () => (canSpeech.val = true);
uttr.onstart = (e) => console.log(e);

const combinations = (arr: string[]) =>
  arr
    .reduce(
      (result, value) => result.concat(result.map((x) => x + value)),
      [""]
    )
    .slice(1);

const keys = ["name", "lang", "default", "localService", "voiceURI"];
const testText = combinations([
  "aaa",
  "ぼぼぼ",
  "123",
  "hello",
  "テキストだよ",
]);
const lang = ["ja-JP", "en-US"];

const Hello = () => {
  van.derive(() => (uttr.voice = nowVoice.val));

  const speechVoice = (text: string) => {
    if (speechSynthesis.speaking) return;
    uttr.text = text;
    speechSynthesis.speak(uttr);
    canSpeech.val = false;
  };

  const setVoiceData = () => {
    const a = speechSynthesis.getVoices();
    if (a.length <= voices.val.length) return;
    voices.val = a;
    uttr.lang = lang[0];
    nowVoice.val = voices.val.find((v) => v.lang === uttr.lang)!;
  };
  speechSynthesis.addEventListener("voiceschanged", setVoiceData);
  setVoiceData();

  return div(
    p(`status: ${canUseSpeechSynthesisText}`),
    select(
      {
        onchange: (e) => {
          uttr.lang = e.target.value;
          nowVoice.val = voices.val.find((v) => v.lang === e.target.value)!;
        },
      },
      lang.map((l) => option({ value: l }, l))
    ),
    p("↓use"),
    table(
      thead(keys.map((k) => th(k))),
      tbody(
        tr(
          keys.map(
            (k) => () => td(nowVoice.val![k as keyof SpeechSynthesisVoice])
          )
        )
      )
    ),
    input({
      type: "text",
      value: text,
      onchange: (e) => (text.val = e.target.value),
      disabled: van.derive(() => !canSpeech.val),
    }),
    button(
      {
        onclick: () => speechVoice(text.val),
        disabled: van.derive(() => !canSpeech.val),
      },
      "読み上げ"
    ),
    div(
      testText.map((t) =>
        button(
          {
            onclick: () => speechVoice(t),
            disabled: van.derive(() => !canSpeech.val),
          },
          t
        )
      )
    ),
    () =>
      voices.val.length &&
      table(
        thead(
          keys.map((k) => th(k)),
          th("change")
        ),
        tbody(
          voices.val.map((v) =>
            tr(
              keys.map((k) => td(v[k as keyof SpeechSynthesisVoice])),
              button({ onclick: () => (nowVoice.val = v) }, "change")
            )
          )
        )
      )
  );
};

van.add(document.body, () => Hello());
