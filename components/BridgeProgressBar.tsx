import React from 'react';
import { getExplorerUrl } from '../utils/explorerUtils';

type BridgeStep = {
    status: 'pending' | 'active' | 'completed' | 'failed';
    title: string;
    txHash?: string;
};

type BridgeProgressBarProps = {
    steps: {
        lockPending: BridgeStep;
        lockCompleted: BridgeStep;
        mintPending: BridgeStep;
        mintCompleted: BridgeStep;
    };
    currentStep: string | null;
    sourceNetwork?: string;
    targetNetwork?: string;
};

const StatusIcon = ({ status }: { status: BridgeStep['status'] }) => {
    switch (status) {
        case 'completed':
            return (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
        case 'active':
            return (
                <svg className="w-6 h-6 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        case 'failed':
            return (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
        default: // pending
            return <div className="w-6 h-6 bg-gray-300 rounded-full"></div>;
    }
};

const BridgeProgressBar: React.FC<BridgeProgressBarProps> = ({ steps, currentStep, sourceNetwork, targetNetwork }) => {
    const allSteps = [
        { key: 'lockPending', ...steps.lockPending },
        { key: 'lockCompleted', ...steps.lockCompleted },
        { key: 'mintPending', ...steps.mintPending },
        { key: 'mintCompleted', ...steps.mintCompleted }
    ];

    const currentStepIndex = currentStep ? allSteps.findIndex(s => s.key === currentStep) : -1;

        const getConnectorColor = (index: number) => {
        if (index < currentStepIndex) {
            const step = allSteps[index];
            if (step.status === 'completed') return 'bg-green-500';
            if (step.status === 'failed') return 'bg-red-500';
        }
        if (index === currentStepIndex && allSteps[index].status === 'active') {
            return 'bg-blue-500';
        }
        return 'bg-gray-300';
    };

    return (
        <div className="w-full py-6 px-4">
            <div className="relative">
                {allSteps.map((step, index) => {
                    if (index > currentStepIndex +1) return null;
                    if (currentStepIndex === -1 && index > 0) return null;

                    const isVisible = index <= currentStepIndex || (index === currentStepIndex + 1 && allSteps[currentStepIndex]?.status === 'completed');
                    if(!isVisible && !(index === 0 && currentStepIndex === -1)) return null;

                    return (
                        <div key={step.key} className="flex items-start mb-8 last:mb-0">
                            <div className="flex flex-col items-center mr-4">
                                <StatusIcon status={step.status} />
                                {index < allSteps.length - 1 && step.status === 'completed' && (index < currentStepIndex || (index === currentStepIndex && step.status === 'completed')) && (
    <div className={`w-0.5 h-16 mt-2 ${getConnectorColor(index)}`}></div>
)}
                            </div>
                            <div className="mt-1">
                                <p className={`font-medium ${step.status === 'active' ? 'text-blue-600' : ''}`}>{step.title}</p>
                                {step.txHash && (step.key === 'lockCompleted' || step.key === 'mintCompleted') && (
                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                        txhash:<a 
                                            href={getExplorerUrl(
                                                step.key === 'lockCompleted' ? sourceNetwork || '' : targetNetwork || '', 
                                                step.txHash, 
                                                'tx'
                                            )} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            {step.txHash}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BridgeProgressBar;