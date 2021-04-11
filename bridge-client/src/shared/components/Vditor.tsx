import React from 'react'
import Vditor from 'vditor'
import "vditor/dist/index.css"

function VditorFilename(name: string){
    return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').
        replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').
        replace('/\\s/g', '')
}
interface VditorAppProps
{
    lang?: keyof II18n | undefined;
    value?:any;
    height?:string;
    width?:string;
    mode?:"wysiwyg" | "sv" | "ir" | undefined;
    style?:string;
    placeholder?:string;
    mathEngine?:"KaTeX" | "MathJax" | undefined;
    uploadApi?: string;
    uploadFetchApi?: string;
    uploadToken?:string;
    uploadAccept?:string;
    uploadFilename?: ((name: string)=>string);
    input?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
    focus?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
    blur?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
    esc?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
    ctrlEnter?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
    select?: ((value: string, previewElement?: HTMLElement | undefined) => void) | undefined;
}

export default class VditorApp extends React.Component<VditorAppProps> {
    componentDidMount() {
        let that = this
        const vditor = new Vditor('vditor', {
            lang: this.props.lang || 'zh_CN',
            width: this.props.width || "100%",
            height: window.innerHeight + 100,
            typewriterMode: true,
            mode: this.props.mode || 'wysiwyg',
            icon: 'material',
            placeholder: this.props.placeholder || 'Hello, Vditor!',
            preview: {
                markdown: {
                    toc: true,
                    mark: true,
                    footnotes: true,
                    autoSpace: true,
                },
                math: {
                    engine: this.props.mathEngine || 'KaTeX',
                },
            },
            counter: {
                enable: true,
                type: 'text',
            },
            toolbarConfig: {
                pin: true,
            },
            cache: {
                enable: false,
            },
            after() {
                vditor.setValue(that.props.value)
            },
            tab: '\t',
            upload: {
                accept: this.props.uploadAccept || 'image/*,.mp3, .wav, .rar, .zip',
                token: this.props.uploadToken || 'rich',
                url: this.props.uploadApi || '/api/upload/editor',
                linkToImgUrl: this.props.uploadFetchApi || '/api/upload/fetch',
                filename (name) {
                    if (that.props.uploadFilename) {
                        return that.props.uploadFilename(name)
                    }
                    return VditorFilename(name)
                },
            },
            input: this.props.input,
            focus: this.props.focus,
            blur: this.props.blur,
            esc: this.props.esc,
            ctrlEnter: this.props.ctrlEnter,
            select: this.props.select,
        })
    }

    render() {
        const e = React.createElement
        return e(
            'div',
            {id: 'vditor'},
        )
    }
}
