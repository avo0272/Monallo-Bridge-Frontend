/**
 * Utility functions for precise number calculations
 */

/**
 * Performs precise multiplication of two numbers, avoiding floating point precision issues
 * @param arg1 First number to multiply
 * @param arg2 Second number to multiply
 * @returns Result of precise multiplication
 */
export const NumberMul = function(arg1: number | string, arg2: number | string) { 
    var m = 0; 
    var s1 = arg1.toString(); 
    var s2 = arg2.toString(); 
    try { 
        m += s1.split(".")[1].length; 
    } catch (e) {} 
    try { 
        m += s2.split(".")[1].length; 
    } catch (e) {} 
 
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m); 
};

/**
 * Formats a number to a specified number of decimal places
 * @param num Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (num: number, decimals: number = 4): string => {
    return num.toFixed(decimals);
};