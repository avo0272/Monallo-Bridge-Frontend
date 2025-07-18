import React from 'react';

type BurnStep = {
    status: 'pending' | 'active' | 'completed' | 'failed';
    title: string;
    txHash?: string;
};

type BurnProgressBarProps = {
    steps: {
        burnPending: BurnStep;
        burnCompleted: BurnStep;
        mintPending: BurnStep;
        mintCompleted: BurnStep;
    };
    currentStep: string | null;
};

const BurnProgressBar: React.FC<BurnProgressBarProps> = ({ steps, currentStep }) => {
    // Convert steps to array for rendering
    const stepsArray = [
        steps.burnPending,
        steps.burnCompleted,
        steps.mintPending,
        steps.mintCompleted
    ];

    // Get status class name for step
    const getStepStatusClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'active':
                return 'bg-blue-500 animate-pulse';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
        }
    };

    // Get status class name for connector
    const getConnectorStatusClass = (index: number) => {
        const currentStepIndex = currentStep ? [
            'burnPending', 'burnCompleted', 'mintPending', 'mintCompleted'
        ].indexOf(currentStep) : -1;

        if (index >= currentStepIndex) {
            return 'bg-gray-300';
        }

        const prevStepStatus = stepsArray[index].status;
        const nextStepStatus = stepsArray[index + 1].status;

        if (prevStepStatus === 'completed' && nextStepStatus === 'completed') {
            return 'bg-green-500';
        } else if (prevStepStatus === 'completed' && nextStepStatus === 'active') {
            return 'bg-blue-500';
        } else if (prevStepStatus === 'failed' || nextStepStatus === 'failed') {
            return 'bg-red-500';
        } else {
            return 'bg-gray-300';
        }
    };

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {stepsArray.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatusClass(step.status)}`}>
                                {step.status === 'completed' && (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                                {step.status === 'failed' && (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                )}
                                {step.status === 'active' && (
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                )}
                            </div>
                            <p className="mt-2 text-sm font-medium">{step.title}</p>
                            {step.txHash && (
                                <div className="mt-1">
                                    <p className="text-xs text-gray-500 font-mono break-all max-w-[150px]">{step.txHash}</p>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(step.txHash || '')}
                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                        Copy Hash
                                    </button>
                                </div>
                            )}
                        </div>
                        {index < stepsArray.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${getConnectorStatusClass(index)}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default BurnProgressBar;