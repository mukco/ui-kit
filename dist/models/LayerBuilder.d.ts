export interface NnLayer {
    neurons: number;
}
interface Props {
    layers: NnLayer[];
    onChange: (layers: NnLayer[]) => void;
}
/** Interactive NN layer configuration: add/remove layers, set neuron count,
    with a live architecture diagram. Input/output layers are implied. */
export declare function LayerBuilder({ layers, onChange }: Props): import("react").JSX.Element;
export {};
