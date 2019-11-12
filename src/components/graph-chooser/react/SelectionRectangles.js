import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import uuid from "uuid/v4";
import ExtraPropTypes from "react-extra-prop-types";
import Delete from "@material-ui/icons/DeleteOutline";

import {
    px,
    svgNs,
    svgMirrorTitles
} from "../../../Utils";
import "./selection-rectangle.scss";

class SelectionRectangles extends Component {
    constructor(props) {
        super(props);

        const { namespace } = props;

        this.state = {
            // data
            selections: {
                [namespace]: [],
                // namespace2: [
                //     {
                //         id: 'a-guid',
                //         view: {
                //             x: 226,
                //             y: 56,
                //             width: 311,
                //             height: 214,
                //         }
                //     }
                // ]
            },

            // used to modify data
            currentSelectionId: null, // selection being added or handle-resized
            hoveredSelectionId: null,
            activeHandleKey: null,
            isWithinSelection: false,

            mouseDown: false,
            mouseDownAt: null,
            mouseNowAt: null,
            mouseWasAt: null,
            mouseUpAt: null
        };

        this._ourRef = React.createRef();

        this._bindHandlers();
    }

    _bindHandlers() {
        this.renderSelection = this.renderSelection.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseUpDoc = this._handleMouseUpDoc.bind(this);
        this._handleMouseOver = this._handleMouseOver.bind(this);
        this._handleMouseOut = this._handleMouseOut.bind(this);
        this.deleteSelectionClicked = this.deleteSelectionClicked.bind(this);
    }

    componentDidMount() {
        this._offsetParent = this._ourRef.current.offsetParent;
        //console.log(`pageIndex: ${this.props.data.pageIndex} - this._offsetParent: `, this._offsetParent);
        this._offsetParent.addEventListener("mousemove", this._handleMouseMove);
        this._offsetParent.addEventListener("mousedown", this._handleMouseDown);
        this._offsetParent.addEventListener("mouseup", this._handleMouseUp);
        document.addEventListener("mouseup", this._handleMouseUpDoc);
        this._offsetParent.addEventListener("mouseover", this._handleMouseOver);
        this._offsetParent.addEventListener("mouseout", this._handleMouseOut);

        this.mirrorSvgTitles();
    }

    mirrorSvgTitles() {
        svgMirrorTitles(this._ourRef.current.getElementsByTagNameNS(svgNs, 'svg'));
    }

    getSelectionIdString(selections) {
        return JSON.stringify((selections ? selections.map(s => s.id) : []).sort(), null, 2);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { state } = this;

        return state.selections !== nextState.selections ||
            this.props.namespace !== nextProps.namespace ||
            this.props.applyReadOnly !== nextProps.applyReadOnly;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.selections !== this.state.selections) {
            this.mirrorSvgTitles();
        }
    }
    componentWillUnmount() {
        this._offsetParent.removeEventListener("mousemove", this._handleMouseMove);
        this._offsetParent.removeEventListener("mousedown", this._handleMouseDown);
        this._offsetParent.removeEventListener("mouseup", this._handleMouseUp);
        document.removeEventListener("mouseup", this._handleMouseUpDoc);
        this._offsetParent.removeEventListener("mouseover", this._handleMouseOver);
        this._offsetParent.removeEventListener("mouseout", this._handleMouseOut);
    }

    addSelection({ x, y, width, height }) {
        const id = uuid();
        this.setState((state, props) => {
            const { namespace } = props;
            return {
                selections: {
                    ...state.selections,
                    [namespace]: [
                        ...(state.selections[namespace] || []),
                        {
                            id: id,
                            view: {
                                x,
                                y,
                                width,
                                height
                            }
                        }
                    ]
                },
                currentSelectionId: id,
                creating: true
            };
        });
    }
    updateSelection({ selectionId, x, y, width, height, editing }) {
        this.setState((state, props) => {
            const { namespace } = props;
            return {
                selections: {
                    ...state.selections,
                    [namespace]: state.selections[namespace].map(s =>
                        s.id !== selectionId
                            ? s
                            : {
                                ...s,
                                view: {
                                    x,
                                    y,
                                    width,
                                    height
                                },
                                editing
                            }
                    )
                }
            };
        });
    }
    _handleMouseDown(ev) {
        const activeHandleKey = ev.target.classList.contains(this._selectionHandleClass)
            ? ev.target.getAttribute("data-handle-info-key")
            : null;

        const hoveredSelection =
            ev.target.classList.contains(this._selectionRectangleClass) &&
                ev.target.classList.contains(this._hovered)
                ? ev.target
                : null;
        const hoveredSelectionId = hoveredSelection
            ? hoveredSelection.getAttribute("data-id")
            : null;
        const isWithinSelection = !!ev.target.closest(
            `.${this._selectionRectangleClass}`
        );

        const { x, y } = this.getMouseCoords(ev);
        // console.log(`pageIndex: ${this.props.data.pageIndex} - mouseDown ${x}, ${y}`);
        this.setState(
            (state, props) => {
                const currentSelectionId = activeHandleKey
                    ? ev.target
                        .closest(`.${this._selectionRectangleClass}`)
                        .getAttribute("data-id")
                    : state.currentSelectionId;

                return {
                    currentSelectionId,
                    hoveredSelectionId,
                    activeHandleKey,
                    isWithinSelection,

                    mouseDown: true,
                    mouseDownAt: { x, y },
                    mouseUpAt: null
                };
            },
            () => {
                if (!isWithinSelection) {
                    this.addSelection({
                        x,
                        y,
                        width: 0, //this._minimumSize.width,
                        height: 0 //this._minimumSize.height
                    });
                }
            }
        );
    }
    _getHandleResizeDeltas(hi, mdx, mdy) {
        const dx = mdx * (hi.dx || 0);
        const dy = mdy * (hi.dy || 0);
        const dw = mdx * (hi.dw || 0);
        const dh = mdy * (hi.dh || 0);

        return { dx, dy, dw, dh };
    }

    _handleMouseMove(ev) {
        ev.preventDefault();

        const { x, y } = this.getMouseCoords(ev);

        const { scrollWidth, scrollHeight } = this._offsetParent;
        // console.log(`scrollWidth: ${scrollWidth} - scrollHeight: ${scrollHeight}`);

        this.setState((state, props) => ({
            mouseWasAt: state.mouseNowAt ? state.mouseNowAt : { x, y },
            mouseNowAt: { x, y }
        }), () => {
            const { namespace } = this.props;
            const {
                currentSelectionId,
                hoveredSelectionId,
                activeHandleKey,
                mouseDownAt,

                mouseNowAt,
                mouseWasAt,
                selections
            } = this.state;

            const nss = (selections[namespace] || []);

            let mdx = mouseNowAt.x - mouseWasAt.x;
            let mdy = mouseNowAt.y - mouseWasAt.y;
            const hhs = this._handleSize / 2;

            if (hoveredSelectionId) {
                const hoveredSelection = nss.find(s => s.id === hoveredSelectionId);

                if (hoveredSelection.view.x - hhs + mdx < 0) {
                    mdx = -hoveredSelection.view.x + hhs;
                }
                if (hoveredSelection.view.x + hoveredSelection.view.width + hhs + mdx >= scrollWidth) {
                    mdx = scrollWidth - 1 - hoveredSelection.view.x - hoveredSelection.view.width - hhs;
                }
                if (hoveredSelection.view.y - hhs + mdy < 0) {
                    mdy = -hoveredSelection.view.y + hhs;
                }
                if (hoveredSelection.view.y + hoveredSelection.view.height + hhs + mdy >= scrollHeight) {
                    mdy = scrollHeight - 1 - hoveredSelection.view.y - hoveredSelection.view.height - hhs;
                }
                this.updateSelection({
                    selectionId: hoveredSelectionId,
                    x: hoveredSelection.view.x + mdx,
                    y: hoveredSelection.view.y + mdy,
                    width: hoveredSelection.view.width,
                    height: hoveredSelection.view.height,
                    editing: true
                });
            }
            else if (activeHandleKey) {
                const currentSelection = nss.find(s => s.id === currentSelectionId);
                const hi = this._handleInfo[activeHandleKey];

                let d = this._getHandleResizeDeltas(hi, mdx, mdy);

                if (d.dx || d.dy || d.dw || d.dh) {
                    let newWidth = currentSelection.view.width + d.dw;
                    let newHeight = currentSelection.view.height + d.dh;

                    if (
                        newWidth < this._minimumSize.width ||
                        newHeight < this._minimumSize.height ||
                        (currentSelection.view.x + d.dx) < 0 ||
                        (currentSelection.view.y + d.dy) < 0 ||
                        (currentSelection.view.x + newWidth) >= scrollWidth ||
                        (currentSelection.view.y + newHeight) >= scrollHeight
                    ) {
                        if (newWidth < this._minimumSize.width) {
                            mdx = (this._minimumSize.width - currentSelection.view.width) * (hi.dw || 0);
                        }
                        if (newHeight < this._minimumSize.height) {
                            mdy = (this._minimumSize.height - currentSelection.view.height) * (hi.dh || 0);
                        }
                        if ((currentSelection.view.x - hhs + d.dx) < 0) {
                            mdx = -currentSelection.view.x + hhs;
                        }
                        if ((currentSelection.view.y - hhs + d.dy) < 0) {
                            mdy = -currentSelection.view.y + hhs;
                        }
                        if ((currentSelection.view.x + newWidth + hhs) >= scrollWidth) {
                            mdx = scrollWidth - 1 - currentSelection.view.x - currentSelection.view.width - hhs;
                        }
                        if ((currentSelection.view.y + newHeight + hhs) >= scrollHeight) {
                            mdy = scrollHeight - 1 - currentSelection.view.y - currentSelection.view.height - hhs;
                        }
                        d = this._getHandleResizeDeltas(hi, mdx, mdy);
                        newWidth = currentSelection.view.width + d.dw;
                        newHeight = currentSelection.view.height + d.dh;
                    }

                    this.updateSelection({
                        selectionId: currentSelectionId,
                        x: currentSelection.view.x + d.dx,
                        y: currentSelection.view.y + d.dy,
                        width: newWidth,
                        height: newHeight,
                        editing: true
                    });
                }
            }
            else if (currentSelectionId) {
                const x1 = Math.min(mouseDownAt.x, mouseNowAt.x);
                const x2 = Math.max(mouseDownAt.x, mouseNowAt.x);
                const y1 = Math.min(mouseDownAt.y, mouseNowAt.y);
                const y2 = Math.max(mouseDownAt.y, mouseNowAt.y);

                const width = Math.max(x2 - x1, 0);//this._minimumSize.width);
                const height = Math.max(y2 - y1, 0);//this._minimumSize.height);

                this.updateSelection({
                    selectionId: currentSelectionId,
                    x: x1,
                    y: y1,
                    width,
                    height,
                    editing: true
                });
            }
        });
    }

    getMouseCoords(ev) {
        const rect = this._ourRef.current.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    }

    notifySelectionChanged({ id, deletion } = {}) {
        const { selectionChanged, namespace } = this.props;
        const { selections } = this.state;
        const nss = (selections[namespace] || []);

        if (selectionChanged) {
            const { currentSelectionId, hoveredSelectionId } = this.state;
            const selId = currentSelectionId || hoveredSelectionId || id;
            const selection = nss.find(s => s.id === selId);
            if (selection) {
                selectionChanged({
                    data: selection.data,
                    id: selection.id || selId,
                    namespace,
                    selection: deletion ? null : selection
                });
            }
        }
    }

    _doFinishOperation(ev) {
        const { x, y } = this.getMouseCoords(ev);
        // console.log(`pageIndex: ${this.props.data.pageIndex} - _doFinishOperation - setting mouseDown: false`);
        this.setState({
            mouseDown: false,
            mouseUpAt: { x, y }
        }, () => {
            this.notifySelectionChanged();

            this.setState((state, props) => {
                const { namespace } = props;
                return {
                    currentSelectionId: null,
                    hoveredSelectionId: null,
                    activeHandleKey: null,
                    isWithinSelection: false,
                    creating: false,
                    selections: {
                        ...state.selections,
                        [namespace]: (state.selections[namespace] || []).map(s => ({ ...s, editing: false }))
                    }
                };
            });
        }
        );
    }
    _handleMouseUp(ev) {
        ev.preventDefault();
        const { mouseDown } = this.state;
        if (!mouseDown) {
            return;
        }

        const { x, y } = this.getMouseCoords(ev);
        // console.log(`pageIndex: ${this.props.data.pageIndex} - mouseUp: ${x}, ${y}`);

        const {
            currentSelectionId,
            creating,
            mouseDownAt,

            mouseNowAt
        } = this.state;

        const { scrollWidth, scrollHeight } = this._offsetParent;

        if (creating) {
            let x1 = Math.min(mouseDownAt.x, mouseNowAt.x);
            let y1 = Math.min(mouseDownAt.y, mouseNowAt.y);

            const x2 = Math.max(mouseDownAt.x, mouseNowAt.x);
            const y2 = Math.max(mouseDownAt.y, mouseNowAt.y);

            const width = Math.max(x2 - x1, this._minimumSize.width);
            const height = Math.max(y2 - y1, this._minimumSize.height);

            if (x1 + width >= scrollWidth) {
                x1 = scrollWidth - width - 1;
            }
            if (y1 + height >= scrollHeight) {
                y1 = scrollHeight - height - 1;
            }

            this.updateSelection({
                selectionId: currentSelectionId,
                x: x1,
                y: y1,
                width,
                height,
                editing: true
            });
        }

        // if (!isWithinSelection) {
        this._doFinishOperation(ev);
        // }
    }

    _handleMouseUpDoc(ev) {
        ev.preventDefault();

        const { mouseDown } = this.state;
        const { scrollTop, scrollLeft, scrollWidth, scrollHeight } = this._offsetParent;

        const { x, y } = this.getMouseCoords(ev);

        if (mouseDown) {
            // console.log(`has mouse: pageIndex: ${this.props.data.pageIndex} - mouseUpDoc: ${x}, ${y}`);
            this._handleMouseUp(ev);
        }
        // else {
        //     console.log(`DOES NOT have mouse: pageIndex: ${this.props.data.pageIndex} - mouseUpDoc: ${x}, ${y}`);
        // }
    }

    _selectionRectangleClass = "selection-rectangle";
    _selectionHandleClass = "selection-handle";
    _externalChildNodesClass = "external-child-nodes";
    _hovered = "hovered";
    _readOnly = "read-only";

    _minimumSize = { width: 250, height: 100 };
    _handleSize = 9;
    _borderSize = 3;

    mouseOverOutCounter = 1;

    isReadOnly(id) {
        return this.props.applyReadOnly && this.props.readOnlyIds.includes(id);
    }
    _handleMouseOver(ev) {
        const selRect = ev.target.closest(`.${this._selectionRectangleClass}`);
        if (selRect) {
            const id = selRect.getAttribute("data-id");
            if (!this.isReadOnly(id)) {
                this.hoverSelection(id, () => { });
            }
        }
    }

    _handleMouseOut(ev) {
        const selRect = ev.target.closest(`.${this._selectionRectangleClass}`);
        if (selRect) {
            const id = selRect.getAttribute("data-id");
            this.unhoverSelection(id, () => { });
        }
        // if (
        //     ev.target === this._offsetParent &&
        //     (!ev.toElement || !ev.toElement.classList.contains("selection-rectangle"))
        // ) {
        //     this._doFinishOperation(ev);
        // }
    }

    deleteSelectionClicked(ev) {
        const selRect = ev.target.closest(`.${this._selectionRectangleClass}`);
        if (selRect) {
            const id = selRect.getAttribute("data-id");
            if (!this.isReadOnly(id)) {
                this.notifySelectionChanged({ id, deletion: true });
                this.deleteSelection(id, () => { });
            }
        }
    }

    _setHovered(id, value, then) {
        this.setState(
            (state, props) => {
                const { namespace } = props;
                return {
                    selections: {
                        ...state.selections,
                        [namespace]: (state.selections[namespace] || []).map(s =>
                            s.id !== id
                                ? s
                                : {
                                    ...s,
                                    [this._hovered]: value
                                }
                        )
                    }
                };
            },
            then
        );
    }
    hoverSelection(id, then) {
        this._setHovered(id, true, then);
    }

    unhoverSelection(id, then) {
        this._setHovered(id, false, then);
    }

    deleteSelection(id, then) {
        this.setState((state, props) => {
            const { namespace } = props;
            return {
                selections: {
                    ...state.selections,
                    [namespace]: (state.selections[namespace] || []).filter(s => s.id !== id)
                }
            };
        });
    }

    _handleInfo = {
        nw: {
            class: "top-left",
            // style: {
            //     left: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`,
            //     top: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`             
            // },
            dx: +1,
            dy: +1,
            dw: -1,
            dh: -1
        },
        n: {
            class: "top-center",
            // style: {
            //     top: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`
            // },
            dy: +1,
            dh: -1
        },
        ne: {
            class: "top-right",
            // style: {
            //     top: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`
            // },
            dy: +1,
            dw: +1,
            dh: -1
        },
        e: {
            class: "right-center",
            // style: {

            // },
            dw: +1
        },
        se: {
            class: "bottom-right",
            // style: {

            // },
            dw: +1,
            dh: +1
        },
        s: {
            class: "bottom-center",
            // style: {

            // },
            dh: +1
        },
        sw: {
            class: "bottom-left",
            // style: {
            //     left: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`
            // },
            dx: +1,
            dw: -1,
            dh: +1
        },
        w: {
            class: "left-center",
            // style: {
            //     left: `calc(0% - (${px(this._borderSize)} + ${px(this._handleSize)}) / 2)`
            // },
            dx: +1,
            dw: -1
        }
    };

    renderSelection(selection, selectionIndex) {
        const { x, y, width, height } = selection.view;
        const {
            getSelectionClass,
            getHandleClass,
            data,
            renderSelectionChildNodes
        } = this.props;
        const { creating } = this.state;

        const additionalClasses = classNames(
            getSelectionClass ? getSelectionClass({ data, selection }) : "",
            {
                creating: creating,
                editing: selection.editing
            }
        );

        const additionalHandleClasses = getHandleClass
            ? getHandleClass({ data, selection })
            : "";

        const { mouseDown } = this.state;
        return (
            <div
                key={selection.id}
                data-id={selection.id}
                style={{
                    position: "absolute",
                    left: px(x),
                    top: px(y),
                    width: px(width),
                    height: px(height),
                    "--handleSize": px(this._handleSize),
                    "--borderSize": px(this._borderSize)
                }}
                className={classNames(
                    this._selectionRectangleClass,
                    additionalClasses,
                    {
                        [this._hovered]: selection.hovered,
                        [this._readOnly]: this.isReadOnly(selection.id)
                    }
                )}
            >
                {Object.entries(this._handleInfo).map(([k, hi]) => (
                    <div
                        className={classNames(
                            `selection-handle ${hi.class}`,
                            additionalHandleClasses
                        )}
                        // style={hi.style}
                        data-handle-info-key={k}
                        key={k}
                    />
                ))}
                <Delete
                    className="delete"
                    title="Remove selection"
                    onClick={this.deleteSelectionClicked}
                />
                {renderSelectionChildNodes &&
                    renderSelectionChildNodes({
                        data,
                        selection,
                        selectionIndex,
                        mouseDown
                    })}
            </div>
        );
    }

    render() {
        const { namespace } = this.props;
        const { selections } = this.state;
        const nss = selections[namespace] || [];
        // const nss = await this.ensureNamespaceSelections();

        return (
            <div className="selection-container" ref={this._ourRef}>
                {nss.map(this.renderSelection)}
            </div>
        );
    }
}

SelectionRectangles.propTypes = {
    // an opaque piece of data provided by the parent, to be returned within event-handlers
    data: PropTypes.any,

    // an opaque string which namespaces the selections into a two-level hiearchy by namespace
    namespace: PropTypes.string,

    // a function ({ data, selection }) which provides the css class for the selection rectangle dependent upon its inputs 
    getSelectionClass: PropTypes.func,

    // a function ({ data, selection }) which provides the css class for the selection rectangle handles dependent upon its inputs 
    getHandleClass: PropTypes.func,

    // a function ({ data, selection, selectionIndex, mouseDown }) which renders some component sub-tree within the selection rectangle dependent upon its inputs
    renderSelectionChildNodes: PropTypes.func,

    // a function ({ id, deletion }) which notifies that a selection has changed
    selectionChanged: PropTypes.func,

    // a list of ids of selections which should be considered read-only
    readOnlyIds: PropTypes.arrayOf(ExtraPropTypes.uuid),

    // whether to enforce the read-only behaviour for those selections specified by 'readOnlyIds'
    applyReadOnly: PropTypes.bool,
};

SelectionRectangles.defaultProps = {
    readOnlyIds: [],
    applyReadOnly: true,
    namespace: 'defaultNamespace'
};

export default SelectionRectangles;
