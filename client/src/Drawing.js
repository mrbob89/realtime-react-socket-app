import React, { Component } from 'react';
import Canvas from 'simple-react-canvas';
import { publishLine, subscribeToDrawingLines } from './api';

class Drawing extends Component {
    state = {
        lines: []
    };

    componentDidMount() {
        subscribeToDrawingLines(this.props.drawing.id, linesEvent => {
            this.setState(state => ({
                lines: [...state.lines, ...linesEvent.lines]
            }));
        });
    }

    handleDraw = line => {
        publishLine({
            drawingId: this.props.drawing.id,
            line
        });
    }

    render() {
        const { drawing } = this.props;

        return drawing ? (
            <div className="Drawing">
                <div className="Drawing-title">
                    {drawing.name}
                    ({this.state.lines.length})
                </div>
                <Canvas
                    drawingEnabled
                    onDraw={this.handleDraw}
                    lines={this.state.lines}
                />
            </div>
        ) : null;
    }
}

export default Drawing;