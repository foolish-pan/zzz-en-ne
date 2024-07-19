'use client'

import React from "react";
import _ from "lodash";


interface IState {
  source: string,
  target: string,
  excludeInterpunction: boolean
}

export default class Home extends React.Component<any, IState> {

  constructor(props: any) {
    super(props);
    this.state = {
      source: '',
      target: '',
      excludeInterpunction: true,
    }
  }

  dictArray = ['嗯', '恩', '眤', '昵', '呢'];

  radixLength = this.calcRadixLength(this.dictArray.length);

  encoder = new TextEncoder();

  decoder = new TextDecoder();

  interpunctionPartten = /[`·~\.,\?!:;"'“”‘’\(\)\[\]\{\}《》「」『』——…\u002c\u3000\u3001\u3002\uff0c\uff01\uff1a\uff1b\uff1f\uff08\uff09\u3010\u3011\u300a\u300b\u3008\u3009\u301c\u301d\u301e\u301f\uffe5\u2026\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2030\u2039\u203a\u3005\u3006\u3007\u30fb\uff65\uff5e\uffe3]/gu;

  getAllMatchIndexes(str: string, regex: RegExp) {
    let indexes = [];
    let match;
    while (match = regex.exec(str)) {
      indexes.push(match.index);
      regex.lastIndex = match.index + match[0].length;
    }
    return indexes;
  }

  calcRadixLength(radix: number): number {
    if (radix > 0) {
      let radixLength = 1;
      while (radix < 255) {
        radix *= radix;
        radixLength++;
      }
      return radixLength;
    } else {
      return 0;
    }
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

    console.log(this.radixLength)

    let chunkArray = _.chunk(decodeArray, this.radixLength)
    let byteArray = [];
    for (let item of chunkArray) {
      byteArray.push(Number.parseInt(item.join(''), this.dictArray.length));
    }
    return this.decoder.decode(new Uint8Array(byteArray))
  }

  sourceToTarget(source: string): void {
    let matchIndex = this.getAllMatchIndexes(source, this.interpunctionPartten);
    let matchChars = source.match(this.interpunctionPartten);

    source = source.replaceAll(this.interpunctionPartten, '');

    let charArray = source.split('');

    let resultArray = [];
    for (let char of charArray) {
      let hexStr = this.textEncode(char);
      resultArray.push(hexStr)
    }

    for (let i = 0; i < matchIndex.length; i++) {
      resultArray.splice(matchIndex[i], 0, matchChars[i])
    }

    this.setState({ target: resultArray.join('') });
  }

  targetToSource(target: string): void {
    console.log(target)

    let matchChars = target.match(this.interpunctionPartten);
    let charArray = target.split(this.interpunctionPartten);
    for (let i = 0; i < charArray.length; i++) {
      let decodeStr = this.textDecode(charArray[i]);
      charArray[i] = decodeStr;
    }

    let resultArray = [];
    for (let i = 0; i < Math.max(matchChars.length, charArray.length); i++) {
      if (i < charArray.length) {
        resultArray.push(charArray[i])
      }
      if (i < matchChars.length) {
        resultArray.push(matchChars[i]);
      }
    }

    this.setState({ source: resultArray.join('') })
  }

  setSource(source: string) {
    this.setState({ source })
  }

  setTarget(target: string) {
    this.setState({ target })
  }

  render(): React.ReactNode {
    return (
      <main className="flex h-dvh flex-col items-center justify-between p-4 bg-[url('/images/bg.04dd4630..jpg')]">
        <div className="container mx-auto  h-1/2">
          <div className="container mx-auto w-full h-1/5 bg-[url('/images/frame.ae80c163.top.png')] bg-cover"></div>
          <div className="container mx-auto w-full h-3/5 p-4 bg-[url('/images/frame.ae80c163.1px.png')] bg-repeat-y">
            <textarea className="w-full h-full" value={this.state.source} onChange={(event) => this.setSource(event.target.value)} />
          </div>
          <div className="container mx-auto w-full h-1/5 bg-[url('/images/frame.ae80c163.bottom.png')] bg-cover"></div>
        </div>


        <textarea value={this.state.target} onChange={(event) => this.setTarget(event.target.value)} />
        <input type="button" onClick={() => { this.sourceToTarget(this.state.source) }} value="翻译" />
        <input type="button" onClick={() => { this.targetToSource(this.state.target) }} value="en-ne" />
      </main>
    );
  }

}

