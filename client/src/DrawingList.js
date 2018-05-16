import React, { Component } from 'react';
import { subscribeToDrawings } from './api';

class DrawingList extends Component {
    constructor(props) {
        super(props);

        subscribeToDrawings(drawing => {
            this.setState(state => ({
                drawings: [...state.drawings, drawing]
            }));
        });
    }

    state = {
        drawings: []
    };

    render() {
        const { drawings } = this.state;

        return (
            <ul className="DrawingList">
                {drawings.map(drawing => (
                    <li
                        key={drawing.id}
                        className="DrawingList-item"
                        onClick={e => this.props.selectDrawing(drawing)}
                    >
                        {drawing.name}
                    </li>
                ))}
            </ul>
        );
    }
}

export default DrawingList;
