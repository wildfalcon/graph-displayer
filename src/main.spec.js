import './main';
import { GraphDisplayerWebComponent } from "./components/graph-displayer/graph-displayer.js";

describe('SyRF components integration tests', () => {
    describe('graph-displayer', () => {
        it(`should be defined`, () => {
            const GraphDisplayerClass = window.customElements.get('graph-displayer');
            expect(GraphDisplayerClass).toBe(GraphDisplayerWebComponent);
        });
    });
});