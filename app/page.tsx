'use client'

import React from "react";
import {Input, Button, ConfigProvider, theme, Row, Col, Space} from "antd";
import copy from "copy-to-clipboard";
import _ from "lodash";


interface IState {
    source: string,
    target: string,
    excludePunctuation: boolean
}

export default class Home extends React.Component<any, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            source: '',
            target: '',
            excludePunctuation: true,
        }
    }

    dictArray = ['嗯', '恩', '眤', '昵', '呢'];

    encodeMask = 255;

    radixLength = this.encodeMask.toString(this.dictArray.length).length;

    encoder = new TextEncoder();

    decoder = new TextDecoder();

    punctuationPattern = /[`·~\.,\?!:;"'“”‘’\(\)\[\]\{\}《》「」『』——…\u002c\u3000\u3001\u3002\uff0c\uff01\uff1a\uff1b\uff1f\uff08\uff09\u3010\u3011\u300a\u300b\u3008\u3009\u301c\u301d\u301e\u301f\uffe5\u2026\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2030\u2039\u203a\u3005\u3006\u3007\u30fb\uff65\uff5e\uffe3]/gu;

    getAllMatchIndexes(str: string, regex: RegExp) {
        let indexes = [];
        let match;
        while (match = regex.exec(str)) {
            indexes.push(match.index);
            regex.lastIndex = match.index + match[0].length;
        }
        return indexes;
    }

    textEncode(source: string): string {
        let byteArray = this.encoder.encode(source);
        let result = '';
        for (let index = 0; index < byteArray.length; index++) {
            let hexStr = byteArray[index].toString(this.dictArray.length).padStart(this.radixLength, '0')
            let hexArray = hexStr.split('');
            for (let i = 0; i < hexArray.length; i++) {
                let hexIndex = Number.parseInt(hexArray[i])
                hexArray[i] = this.dictArray[hexIndex];
            }
            result += hexArray.join('');
        }
        return result;
    }

    textDecode(source: string): string {
        let decodeArray = source.split('');
        for (let i = 0; i < decodeArray.length; i++) {
            let index = this.dictArray.indexOf(decodeArray[i]);
            decodeArray[i] = index.toString();
        }

        let chunkArray = _.chunk(decodeArray, this.radixLength)
        let byteArray = [];
        for (let item of chunkArray) {
            byteArray.push(Number.parseInt(item.join(''), this.dictArray.length));
        }
        return this.decoder.decode(new Uint8Array(byteArray))
    }

    sourceToTarget(source: string): void {
        let matchIndex = this.getAllMatchIndexes(source, this.punctuationPattern);
        let matchChars = source.match(this.punctuationPattern);

        source = source.replaceAll(this.punctuationPattern, '');

        let charArray = source.split('');

        let resultArray = [];
        for (let char of charArray) {
            let hexStr = this.textEncode(char);
            resultArray.push(hexStr)
        }

        if (matchChars) {
            for (let i = 0; i < matchIndex.length; i++) {
                resultArray.splice(matchIndex[i], 0, matchChars[i])
            }
        }
        this.setState({target: resultArray.join('')});
    }

    targetToSource(target: string): void {
        let matchChars = target.match(this.punctuationPattern);
        let charArray = target.split(this.punctuationPattern);
        for (let i = 0; i < charArray.length; i++) {
            let decodeStr = this.textDecode(charArray[i]);
            charArray[i] = decodeStr;
        }

        let resultArray = [];
        for (let i = 0; i < Math.max(matchChars ? matchChars.length : 0, charArray.length); i++) {
            if (i < charArray.length) {
                resultArray.push(charArray[i])
            }
            if (matchChars && i < matchChars.length) {
                resultArray.push(matchChars[i]);
            }
        }
        this.setState({source: resultArray.join('')})
    }

    copyToClipboard(text: string): void {
        let res = copy(text);
    }

    setSource(source: string) {
        this.setState({source})
    }

    setTarget(target: string) {
        this.setState({target})
    }

    render(): React.ReactNode {
        return (
            <main className="flex h-dvh flex-col items-center justify-between p-4 bg-[url('/images/bg.04dd4630..jpg')]">
                <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
                    <Input.TextArea rows={6} value={this.state.source}
                                    onChange={(event) => this.setSource(event.target.value)}/>
                    <Space>
                        <Button type="default" size="large" shape="round"
                                onClick={() => {
                                    this.sourceToTarget(this.state.source)
                                }}>
                            翻译
                        </Button>
                        <Button type="default" size="large" shape="round"
                                onClick={() => {
                                    this.copyToClipboard(this.state.source)
                                }}>
                            复制
                        </Button>
                    </Space>
                    <Space>
                        <Button type="default" size="large" shape="round"
                                onClick={() => {
                                    this.copyToClipboard(this.state.target)
                                }}>
                            复制
                        </Button>
                        <Button type="default" size="large" shape="round"
                                onClick={() => {
                                    this.targetToSource(this.state.target)
                                }}>
                            en-ne
                        </Button>
                    </Space>
                    <Input.TextArea rows={6} value={this.state.target}
                                    onChange={(event) => this.setTarget(event.target.value)}/>
                </ConfigProvider>
            </main>
        );
    }

}

