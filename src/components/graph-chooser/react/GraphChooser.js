import React from "react";
import pdfjsLib from "@bundled-es-modules/pdfjs-dist/build/pdf";
import classNames from "classnames";
import Draggable from "react-draggable";
import Lock from "@material-ui/icons/Lock";
import LockOpen from "@material-ui/icons/LockOpen";
import DragHandle from "@material-ui/icons/DragHandle";

import ZoomControls from './ZoomControls';
import SelectionRectangles from "./SelectionRectangles";
import "./graph-chooser.scss";

import {
    persistSettings,
    recoverSettings,
    svgNs,
    svgMirrorTitles,
    clone,
    removeProps,
    doZoomFloatValueSteps
} from "../../../Utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default class GraphChooserMainUi extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pageCount: -1,
            pageCanvasRefs: null,
            curPage: 1,
            dpr: window.devicePixelRatio,
            pageInfo: [],
            pdf: null,
            pdfUrl: null,
            selectOutcomes: null,
            graphChosen: false,

            settings: {
                settingsVersion: 2,
                lockSelectedGraphs: true,
                pdfScale: { value: 1 }
            },

            // maps graph id to outcome id
            graphInfo: {
                // ['graph-guid']: {
                //     outcomeId: null,
                //     pdfUrl: null,
                //     pageIndex: 0,
                //     readOnly: false,
                //     view: { x, y, width, height }
                // }
            }
        };

        this._docWrapper = React.createRef();
        this._bindHandlers();
        this._notSelectedId = "not-selected";
        this.setStateAsync = updater => new Promise(resolve => this.setState(updater, resolve));
        this._ourRef = React.createRef();
    }

    _bindHandlers() {
        this.persistSettings = this.persistSettings.bind(this);
        this.recoverSettings = this.recoverSettings.bind(this);
        this.graphOutcomeSelectionChanged = this.graphOutcomeSelectionChanged.bind(this);
        this.toggleLockSelectedGraphs = this.toggleLockSelectedGraphs.bind(this);
        this.useSelectedGraphs = this.useSelectedGraphs.bind(this);
        this.renderSelectionChildNodes = this.renderSelectionChildNodes.bind(this);
        this.getSelectionClass = this.getSelectionClass.bind(this);
        this.getHandleClass = this.getHandleClass.bind(this);
        this.graphSelectionChanged = this.graphSelectionChanged.bind(this);
        this.pdfScaleUp = this.pdfScaleUp.bind(this);
        this.pdfScaleDown = this.pdfScaleDown.bind(this);
    }

    _settingsKey = this.props.settingsKey || 'graphChooserSettings';

    persistSettings() {
        persistSettings({ component: this, localStorage: this.props.localStorage, settingsKey: this._settingsKey });
    }
    recoverSettings() {
        recoverSettings({ component: this, localStorage: this.props.localStorage, settingsKey: this._settingsKey });
    }

    _scaleSteps = [{
        from: 0,
        to: 0.25,
        increment: 0
    }, {
        from: 0.25,
        to: 1,
        increment: 0.25
    }, {
        from: 1,
        to: 4,
        increment: 0.5
    }, {
        from: 4,
        to: 10,
        increment: 1
    }];

    _doPdfScaleUpDown(down) {
        this.setState((state, props) => {
            const { pdfScale } = state.settings;
            return {
                settings: {
                    ...state.settings,
                    pdfScale: {
                        value: doZoomFloatValueSteps(
                            down,
                            pdfScale.value,
                            this._scaleSteps
                        )
                    }
                }
            }
        });
    }

    pdfScaleUp() {
        this._doPdfScaleUpDown(false);
    }
    pdfScaleDown() {
        this._doPdfScaleUpDown(true);
    }


    allPagesLoaded() {
        this.setState(
            (state, props) => {
                return {
                    pageInfo: state.pageInfo.map(pi => ({
                        ...pi
                    }))
                };
            },
            () => {
            }
        );
    }
    graphOutcomeSelectionChanged(ev) {
        const select = ev.target;
        const selectionRect = select.closest(".graph-selection-rect");

        const graphId = selectionRect.getAttribute("data-id");
        const pageIndex = +selectionRect
            .closest(".pdf-page-wrapper")
            .getAttribute("data-page-index");

        this.setState((state, props) => {
            const { graphInfo } = state;
            const newOutcomeId = select.value;

            return {
                graphInfo: {
                    ...graphInfo,
                    [graphId]: {
                        ...graphInfo[graphId],
                        outcomeId: newOutcomeId,
                        pageIndex,
                        readOnly: newOutcomeId && newOutcomeId !== this._notSelectedId
                    }
                }
            };
        });
    }

    toggleLockSelectedGraphs(ev) {
        this.setState((state, props) => {
            return {
                settings: {
                    ...state.settings,
                    lockSelectedGraphs: !state.settings.lockSelectedGraphs
                }
            };
        });
    }

    getSelectedGraphCount() {
        const { graphInfo, pdfUrl } = this.state;
        const count = Object.entries(graphInfo)
            .filter(([_, v]) =>
                v.pdfUrl === pdfUrl
                && v.outcomeId
                && v.outcomeId !== this._notSelectedId
            ).length;
        return count;
    }
    useSelectedGraphs(ev) {
        const { raiseGraphChosen } = this.props;
        const { graphInfo, pdfUrl, settings } = this.state;
        const { pdfScale } = settings;

        const graphData = Object.entries(graphInfo)
            .filter(([k, v]) =>
                v.pdfUrl === pdfUrl
                && v.outcomeId
                && v.outcomeId !== this._notSelectedId
            )
            .map(([k, v]) => {
                const { x, y, width, height } = v.view;
                return {
                    outcomeId: v.outcomeId,
                    pageIndex: v.pageIndex,
                    coords: { x, y, w: width, h: height }
                };
            });

        this.setState({ graphChosen: true }, () => {
            raiseGraphChosen({
                message: "Graph chosen",
                graphData,
                pdfUrl,
                pdfScale: pdfScale.value
            });
        });
    }

    renderSelectionChildNodes({ data, selection, selectionIndex, mouseDown }) {
        const { selectOutcomes, graphInfo } = this.state;
        const gi = graphInfo[selection.id];

        return (
            <Draggable
                handle=".drag-group .drag-handle"
                bounds="parent"
            >
                <div
                    className={classNames("drag-group", {
                        selected: gi && gi.outcomeId && gi.outcomeId !== this._notSelectedId
                    })}
                >
                    <div className='inner-group'>
                        <DragHandle className='drag-handle' />
                        <select
                            title="Linked Outcome"
                            size={1}
                            className="graph-selection-outcome-list"
                            onChange={this.graphOutcomeSelectionChanged}
                            value={!!gi ? gi.outcomeId : this._notSelectedId}
                        >
                            {selectOutcomes.map(o => (
                                <option key={o.id} value={o.id}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Draggable>
        );
    }

    getSelectionClass({ data, selection }) {
        const { graphInfo } = this.state;
        const info = graphInfo[selection.id];
        const curOutcomeId = info ? info.outcomeId : this._notSelectedId;

        const classStr = [
            !!curOutcomeId && curOutcomeId !== this._notSelectedId ? "selected" : "",
            "graph-selection-rect"
        ].join(" ");

        return classStr;
    }

    getHandleClass({ data, selection }) {
        const { graphInfo } = this.state;
        const info = graphInfo[selection.id];
        const curOutcomeId = info ? info.outcomeId : this._notSelectedId;

        const classStr = [
            !!curOutcomeId && curOutcomeId !== this._notSelectedId ? "selected" : "",
            "graph-selection-handle"
        ].join(" ");

        return classStr;
    }

    graphSelectionChanged({ data, id, namespace, selection }) {
        this.setState((state, props) => {
            const { graphInfo } = state;

            return {
                graphInfo: !!selection
                    ? {
                        ...graphInfo,
                        [id]: {
                            ...graphInfo[id],
                            pdfUrl: namespace,
                            view: clone(selection.view)
                        }
                    }
                    : removeProps(graphInfo, id)
            };
        }, () => {
            // console.log('graphSelectionChanged - after set state: ', JSON.stringify(this.state.graphInfo, null, 2));
        });
    }

    async configure() {
        const config = JSON.parse(this.props.config);
        const { fileUrl, outcomes } = config;

        const selectOutcomes = outcomes
            ? [
                {
                    id: this._notSelectedId,
                    label: "None"
                },
                ...(outcomes ? outcomes : [])
            ]
            : outcomes;

        if (fileUrl) {
            const pdf = await this.loadPdf(fileUrl);

            const { numPages } = pdf;
            const pageIndices = [...Array(numPages)].map((_, i) => i);

            this.setState({
                pdf,
                pdfUrl: fileUrl,
                selectOutcomes,
                pageCount: numPages,
                pageCanvasRefs: pageIndices.map(_ => React.createRef()),
                pageInfo: pageIndices.map(_ => ({
                    loaded: false
                }))
            });
        }
    }

    resetPageLoaded() {
        if (this.state.pageInfo) {
            this.setState((state, props) => ({
                pageInfo: state.pageInfo.map(pi => ({
                    ...pi,
                    loaded: false
                }))
            }));
        }
    }

    async loadPages() {
        this.resetPageLoaded();

        const { pageCanvasRefs, pdf, settings } = this.state;
        const { pdfScale } = settings;
        const scale = pdfScale.value;

        await Promise.all(
            pageCanvasRefs.map(async (pcr, pci) => {
                const page = await pdf.getPage(pci + 1);
                const viewport = page.getViewport({ scale: scale });

                const canvas = pcr.current;
                const canvasContext = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext,
                    viewport
                }).promise;

                this.setState((state, props) => {
                    return {
                        pageInfo: state.pageInfo.map((pi, pii) =>
                            pii !== pci
                                ? pi
                                : {
                                    ...pi,
                                    loaded: true,
                                    page
                                }
                        )
                    };
                });
            })
        );
    }
    async loadPdf(fileUrl) {
        const pdf = await pdfjsLib.getDocument({
            url: fileUrl
        }).promise;

        return pdf;
    }

    mirrorSvgTitles() {
        svgMirrorTitles(this._ourRef.current.getElementsByTagNameNS(svgNs, 'svg'));
    }

    componentDidMount() {
        this.recoverSettings();

        window.addEventListener(
            "beforeunload",
            this.persistSettings
        );

        this.mirrorSvgTitles();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.config !== this.props.config) {
            this.configure();
        } else if (prevState.pageCanvasRefs !== this.state.pageCanvasRefs) {
            this.loadPages();
        } else if (prevState.settings.lockSelectedGraphs !== this.state.settings.lockSelectedGraphs) {
            this.mirrorSvgTitles();
        } else if (prevState.settings.pdfScale.value !== this.state.settings.pdfScale.value) {
            if (this.state.pageCanvasRefs) {
                this.loadPages();
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.persistSettings
        );

        this.persistSettings();
    }


    render() {
        const {
            pageCount,
            pageCanvasRefs,
            pdf,
            pdfUrl,
            selectOutcomes,
            pageInfo,
            graphInfo,
            settings,
        } = this.state;

        const selectedCount = this.getSelectedGraphCount();
        const useSelectedGraphsLabel = [
            'Use selected ',
            selectedCount !== 1 ? selectedCount + ' ' : '',
            'graph',
            selectedCount !== 1 ? 's' : ''
        ].join('');

        const { lockSelectedGraphs, pdfScale } = settings;

        return (
            <div className="graph-chooser-main-ui" ref={this._ourRef}>
                <div className="header-bar">
                    <span className="load-progress">
                        {pageInfo.map(({ loaded }, i) => (
                            <a
                                key={i}
                                className={classNames({
                                    "page-loaded-status": true,
                                    loaded: loaded
                                })}
                                href={`#page-${i}`}
                            >
                                {i + 1}
                            </a>
                        ))}
                    </span>
                    {pdf && <ZoomControls
                        showSquared={false}
                        zoomInfo={pdfScale}
                        zoomOut={this.pdfScaleDown}
                        zoomIn={this.pdfScaleUp}
                        label='PDF scale'
                        showMultiplier={true}
                    />}
                    {lockSelectedGraphs
                        && <Lock className='clickable lock-selected-graphs'
                            title='Outcome-assigned graphs are locked'
                            onClick={this.toggleLockSelectedGraphs}
                        />}
                    {!lockSelectedGraphs
                        && <LockOpen className='clickable lock-selected-graphs'
                            title='Outcome-assigned graphs are editable'
                            onClick={this.toggleLockSelectedGraphs}
                        />}

                    {selectedCount > 0
                        && <button onClick={this.useSelectedGraphs}>{useSelectedGraphsLabel}</button>
                    }
                </div>
                {pdf && selectOutcomes && (
                    <div ref={this._docWrapper} className="doc-wrapper">
                        {pageCount > 0 &&
                            [...Array(pageCount).keys()].map(pageIndex => {
                                const pageGraphInfos = Object.entries(graphInfo).filter(([k, v]) =>
                                    v.pageIndex === pageIndex
                                );

                                const readOnlyIds = pageGraphInfos
                                    .filter(([k, v]) => v.readOnly)
                                    .map(([k, v]) => k);

                                return (
                                    <div
                                        key={pageIndex}
                                        className="pdf-page-wrapper"
                                        data-page-index={pageIndex}
                                        id={`page-${pageIndex}`}
                                    >
                                        {/* {
                                            pageGraphInfos.filter(([k, pgi]) =>
                                                pgi.outcomeId !== this._notSelectedId
                                            ).map(([k, pgi], index) => <div
                                                className='tracker'
                                                key={`tracker_${index}`}
                                                style={{
                                                    border: '2px solid red',
                                                    padding: '1px',
                                                    position: 'absolute',
                                                    left: px(pgi.view.x - 2),
                                                    top: px(pgi.view.y - 2),
                                                    width: px(pgi.view.width + 4),
                                                    height: px(pgi.view.height + 4)
                                                }} />)
                                        } */}
                                        {!this.state.graphChosen &&
                                            <SelectionRectangles
                                                data={{ pageIndex }}
                                                getSelectionClass={this.getSelectionClass}
                                                getHandleClass={this.getHandleClass}
                                                renderSelectionChildNodes={this.renderSelectionChildNodes}
                                                selectionChanged={this.graphSelectionChanged}
                                                readOnlyIds={readOnlyIds}
                                                applyReadOnly={lockSelectedGraphs}
                                                namespace={pdfUrl}
                                            />
                                        }
                                        <span
                                            className="pdf-page-number"
                                            title={`Page ${pageIndex + 1}`}
                                        >
                                            {pageIndex + 1}
                                        </span>
                                        <canvas
                                            ref={pageCanvasRefs[pageIndex]}
                                            className="pdf-page-canvas"
                                        />
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        );
    }
}
