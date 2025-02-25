import { useContext } from "react";
import { Button, toast } from "@renderer/components/ui";
import { t } from "i18next";
import {
  MediaPlayerProviderContext,
  AppSettingsProviderContext,
} from "@/renderer/context";
import { AlignmentResult } from "echogarden/dist/api/API.d.js";
import { convertWordIpaToNormal } from "@/utils";
import template from "./transcription.template.html?raw";

export const MediaTranscriptionDownload = () => {
  const { media, transcription } = useContext(MediaPlayerProviderContext);
  const { EnjoyApp, learningLanguage, ipaMappings } = useContext(
    AppSettingsProviderContext
  );

  function generateContent() {
    const language = transcription.language || learningLanguage;
    const sentences = transcription.result as AlignmentResult;

    const contents = sentences.timeline.map((sentence) => {
      let words = sentence.text.split(" ");

      const ipas = sentence.timeline.map((w) =>
        w.timeline.map((t) =>
          language.startsWith("en")
            ? convertWordIpaToNormal(
                t.timeline.map((s) => s.text),
                { mappings: ipaMappings }
              ).join("")
            : t.text
        )
      );

      if (words.length !== sentence.timeline.length) {
        words = sentence.timeline.map((w) => w.text);
      }

      return `
        <div class='sentence'>
          ${words
            .map(
              (word, index) => `
                <div class='word-wrap'>
                  <div class='text'>${word}</div>
                  <div class='ipa'>${ipas[index]}</div>
                </div>`
            )
            .join("")}
        </div>`;
    });

    return template
      .replace("$title", media.name)
      .replace("$content", contents.join(""));
  }

  async function download() {
    try {
      const savePath = await EnjoyApp.dialog.showSaveDialog({
        title: t("download"),
        defaultPath: `${media.name}.pdf`,
      });

      if (!savePath) return;

      await EnjoyApp.download.printAsPdf(generateContent(), savePath);

      toast.success(t("downloadedSuccessfully"));
    } catch (err) {
      toast.error(`${t("downloadFailed")}: ${err.message}`);
    }
  }

  return (
    <Button variant="ghost" className="block w-full" onClick={download}>
      {t("download")}
    </Button>
  );
};
