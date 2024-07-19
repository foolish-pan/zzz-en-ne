
import React, { Component } from "react";

interface IProps {

}

interface IState {

}

class Test01 extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {

        }
    }

    render(): React.ReactNode {
        return (
            <div>
                123123
                <textarea></textarea>
            </div>
        );
    }
}

export default Test01;