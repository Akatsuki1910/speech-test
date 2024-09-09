import van from "vanjs-core";
const {
  p,
  div,
  input,
  button,
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
const nowVoice = van.state<SpeechSynthesisVoice | undefined>(undefined);

const uttr = new SpeechSynthesisUtterance("");
uttr.onend = () => (canSpeech.val = true);
uttr.onstart = (e) => console.log(e);
uttr.pitch = 1;
uttr.rate = 1;
uttr.volume = 1;

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

const LANG = ["ja-JP", "en-US"] as const;
type SpeechVoiceKey = (typeof LANG)[number];
const speechVoiceMap = new Map<SpeechVoiceKey, string[]>([
  ["ja-JP", ["Kyoko", "Sayaka"]],
  ["en-US", ["Samantha", "Flo", "Ralph"]],
]);

const setSpeechLang = (lang: SpeechVoiceKey) => {
  uttr.lang = lang;
  nowVoice.val =
    (speechVoiceMap
      .get(uttr.lang as typeof lang)
      ?.map((n) =>
        voices.val.find((v) => v.voiceURI.includes(n) && v.lang === uttr.lang)
      ) ?? [])[0] ?? voices.val.find((v) => v.lang === uttr.lang)!;
};

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
  setSpeechLang("ja-JP");
};

const Hello = () => {
  van.derive(() => {
    if (nowVoice.val?.lang) uttr.voice = nowVoice.val;
  });

  speechSynthesis.addEventListener("voiceschanged", setVoiceData);
  setVoiceData();

  return div(
    p(`status: ${canUseSpeechSynthesisText}`),
    select(
      { onchange: (e) => setSpeechLang(e.target.value as SpeechVoiceKey) },
      [...speechVoiceMap.keys()].map((l) => option({ value: l }, l))
    ),
    p("↓use"),
    table(
      thead(keys.map((k) => th(k))),
      tbody(
        tr(
          keys.map(
            (k) => () =>
              td((nowVoice.val ?? {})[k as keyof SpeechSynthesisVoice])
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
