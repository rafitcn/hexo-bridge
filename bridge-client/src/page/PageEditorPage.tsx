import React, { useLayoutEffect, useState } from "react";
import Navigation from "../shared/components/Navigation";
import { Prompt, useParams } from "react-router-dom";
import useAPI from "../shared/useAPI";
import { Button, ButtonGroup, ControlGroup, Divider, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import { parsePageData, validateRequiredPageMetadataFields } from "../shared/helpers/frontMatterParserHelper";
import FrontMatterEditor from "../shared/components/FrontMatterEditor";
import { Notification } from "../shared/helpers/notification";
import PageEditorActionDropdown from "./PageEditorActionDropdown";
import GenericError from "../shared/components/GenericError";
import { AxiosRequestConfig } from "axios";
import { RouteParams } from "../shared/types/router";
import VditorApp from "../shared/components/Vditor";

const frontMatterHelper = require("hexo-front-matter");

//API Config section
const getSinglePageAPI: AxiosRequestConfig = {
  method: "POST",
  url: "pages/getSingle",
};

const savePageAPI: AxiosRequestConfig = {
  method: "POST",
  url: "pages/save",
};

const getUserPrefsAPI: AxiosRequestConfig = {
  method: "GET",
  url: "settings/bridge/getAsJson",
};

export default function PageEditorPage() {
  const { id } = useParams<RouteParams>();
  const { data: userPrefs } = useAPI(getUserPrefsAPI);
  //Get page from api
  const { loading: isLoading, error, data: pageData } = useAPI({
    ...getSinglePageAPI,
    data: {
      id: id,
    },
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [metadata, setMetadata] = useState({ title: "", categories: [], tags: [], date: new Date().toISOString() });
  const [content, setContent] = useState("");
  const [showFrontMatterEditor, setShowFrontMatterEditor] = useState(false);
  const { execute: savePage } = useAPI(
    {
      ...savePageAPI,
      data: {
        id: id,
        content: frontMatterHelper.stringify(metadata) + content,
      },
    },
    true
  );

  //Init
  useLayoutEffect(() => {
    if (pageData.raw) {
      const parsedPage = parsePageData(pageData);
      setContent(parsedPage.content);
      setMetadata(parsedPage.meta);
    }
  }, [pageData]);

  async function onSave() {
    try {
      await savePage();
      setHasUnsavedChanges(false);
      Notification.show({
        message: "Saved!",
        intent: Intent.SUCCESS,
        icon: "saved",
      });
    } catch (error) {
      console.error("Unable to save page.", error);
      Notification.show({
        message: "Oh no, I can't save the page. 😟 ",
        intent: Intent.DANGER,
        icon: "delete",
      });
    }
  }

  function getState() {
    if (isLoading) {
      return <Spinner />;
    }
    if (error) {
      return <GenericError />;
    }
    return (
      <>
        <ControlGroup className="margin">
          <InputGroup
            leftIcon="edit"
            placeholder="I ❤️ hexo."
            value={metadata.title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setMetadata({ ...metadata, title: event.target.value });
              setHasUnsavedChanges(true);
            }}
          />
          <Divider />
          <Button
            icon="annotation"
            text="Front matter"
            minimal
            onClick={() => {
              setShowFrontMatterEditor(true);
            }}
          />
          <FrontMatterEditor
            isOpen={showFrontMatterEditor}
            value={frontMatterHelper.stringify(metadata)}
            onClose={(newData) => {
              setShowFrontMatterEditor(false);
              setMetadata(validateRequiredPageMetadataFields(newData));
              setHasUnsavedChanges(true);
            }}
          />
          <span style={{ flexGrow: 1 }} />
          <ButtonGroup minimal>
            <Button text="Save" icon="floppy-disk" onClick={onSave} disabled={!hasUnsavedChanges} />
            <PageEditorActionDropdown savePage={onSave} />
          </ButtonGroup>
        </ControlGroup>
        <div className="code-editor-preview-container">
          <VditorApp  lang={userPrefs.editorLang || "zh_CN"} value={content} mode={userPrefs.editorMode || 'sv'}
                     esc={(value => {
                       setContent(value)
                       setHasUnsavedChanges(true)
                     })}
                     ctrlEnter={(value => {
                       setContent(value)
                       setHasUnsavedChanges(true)
                     })}
                     blur={(value => {
                       setContent(value)
                       setHasUnsavedChanges(true)
                     })}
          />
        </div>
        <Prompt when={hasUnsavedChanges} message="You have unsaved changes, are you sure you want to leave?" />
      </>
    );
  }

  return (
    <>
      <Navigation />
      {getState()}
    </>
  );
}
