import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 工具函数：格式化金额显示
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// 工具函数：计算五险一金
export function calculateFunds(salary: number, fundRatio: number): {
  pension: number,
  medical: number,
  unemployment: number,
  housingFund: number,
  total: number
} {
  // 个人缴纳比例
  const pensionRate = 0.08;    // 养老保险
  const medicalRate = 0.02;    // 医疗保险
  const unemploymentRate = 0.005; // 失业保险
  
  // 计算各项保险金额
  const pension = parseFloat((salary * pensionRate).toFixed(2));
  const medical = parseFloat((salary * medicalRate).toFixed(2));
  const unemployment = parseFloat((salary * unemploymentRate).toFixed(2));
  const housingFund = parseFloat((salary * (fundRatio / 100)).toFixed(2));
  
  // 总计
  const total = parseFloat((pension + medical + unemployment + housingFund).toFixed(2));
  
  return { pension, medical, unemployment, housingFund, total };
}

// 工具函数：计算个人所得税（累计预扣法）
export function calculateTax(
  month: number,
  salary: number, 
  funds: number, 
  specialDeductions: number = 0,
  cumulativeTaxableIncome: number = 0,
  cumulativeTaxPaid: number = 0
): {
  tax: number,
  cumulativeTaxableIncome: number,
  cumulativeTax: number
} {
  // 起征点（每月）
  const taxThreshold = 5000;
  
  // 当月应纳税所得额 = 工资收入金额 - 各项社会保险费 - 起征点 - 专项附加扣除
  const monthlyTaxableIncome = Math.max(0, salary - funds - taxThreshold - specialDeductions);
  
  // 累计应纳税所得额（从1月到当前月）
  const currentCumulativeTaxableIncome = cumulativeTaxableIncome + monthlyTaxableIncome;
  
  // 累计预扣预缴应纳税所得额对应的税率和速算扣除数
  let taxRate = 0;
  let quickDeduction = 0;
  
  if (currentCumulativeTaxableIncome <= 36000) {
    taxRate = 0.03;
    quickDeduction = 0;
  } else if (currentCumulativeTaxableIncome <= 144000) {
    taxRate = 0.1;
    quickDeduction = 2520;
  } else if (currentCumulativeTaxableIncome <= 300000) {
    taxRate = 0.2;
    quickDeduction = 16920;
  } else if (currentCumulativeTaxableIncome <= 420000) {
    taxRate = 0.25;
    quickDeduction = 31920;
  } else if (currentCumulativeTaxableIncome <= 660000) {
    taxRate = 0.3;
    quickDeduction = 52920;
  } else if (currentCumulativeTaxableIncome <= 960000) {
    taxRate = 0.35;
    quickDeduction = 85920;
  } else {
    taxRate = 0.45;
    quickDeduction = 181920;
  }
  
  // 累计应纳税额
  const cumulativeTax = Math.max(0, currentCumulativeTaxableIncome * taxRate - quickDeduction);
  
  // 当月应纳税额 = 累计应纳税额 - 累计已预缴税额
  const monthlyTax = Math.max(0, parseFloat((cumulativeTax - cumulativeTaxPaid).toFixed(2)));
  
  return {
    tax: monthlyTax,
    cumulativeTaxableIncome: currentCumulativeTaxableIncome,
    cumulativeTax
  };
}

// 工具函数：计算五险一金（考虑缴费基数上限）
export function calculateFundsWithLimits(
  salary: number, 
  fundRatio: number,
  // 社保和公积金缴费基数上限（2023年北京标准为例）
  socialSecurityBaseLimit: number = 31884,
  housingFundBaseLimit: number = 31884
): {
  pension: number,
  medical: number,
  unemployment: number,
  housingFund: number,
  total: number
} {
  // 个人缴纳比例
  const pensionRate = 0.08;    // 养老保险
  const medicalRate = 0.02;    // 医疗保险
  const unemploymentRate = 0.005; // 失业保险
  
  // 计算缴费基数（不超过上限）
  const socialSecurityBase = Math.min(salary, socialSecurityBaseLimit);
  const housingFundBase = Math.min(salary, housingFundBaseLimit);
  
  // 计算各项保险金额
  const pension = parseFloat((socialSecurityBase * pensionRate).toFixed(2));
  const medical = parseFloat((socialSecurityBase * medicalRate).toFixed(2));
  const unemployment = parseFloat((socialSecurityBase * unemploymentRate).toFixed(2));
  const housingFund = parseFloat((housingFundBase * (fundRatio / 100)).toFixed(2));
  
  // 总计
  const total = parseFloat((pension + medical + unemployment + housingFund).toFixed(2));
  
  return { pension, medical, unemployment, housingFund, total };
}

// 工具函数：生成12个月的计算结果（使用累计预扣法计算个税）
export function generateMonthlyResults(
  salary: number, 
  fundRatio: number,
  specialDeductions: number = 0,
  socialSecurityBaseLimit: number = 31884,
  housingFundBaseLimit: number = 31884
): {
  month: number,
  preTaxSalary: number,
  fundDetails: {
    pension: number,
    medical: number,
    unemployment: number,
    housingFund: number,
    total: number
  },
  tax: number,
  afterTaxSalary: number,
  cumulativeTaxableIncome: number,
  cumulativeTax: number
}[] {
  const results = [];
  let cumulativeTaxableIncome = 0;
  let cumulativeTax = 0;
  
  for (let month = 1; month <= 12; month++) {
    const funds = calculateFundsWithLimits(salary, fundRatio, socialSecurityBaseLimit, housingFundBaseLimit);
    const taxResult = calculateTax(
      month,
      salary, 
      funds.total, 
      specialDeductions,
      cumulativeTaxableIncome,
      cumulativeTax
    );
    
    // 更新累计值
    cumulativeTaxableIncome = taxResult.cumulativeTaxableIncome;
    cumulativeTax = taxResult.cumulativeTax;
    
    const afterTaxSalary = parseFloat((salary - funds.total - taxResult.tax).toFixed(2));
    
    results.push({
      month,
      preTaxSalary: salary,
      fundDetails: funds,
      tax: taxResult.tax,
      afterTaxSalary,
      cumulativeTaxableIncome,
      cumulativeTax
    });
  }
  
  return results;
}

// 工具函数：计算年度汇总
export function calculateAnnualSummary(monthlyResults: ReturnType<typeof generateMonthlyResults>) {
  const totalPreTax = parseFloat((monthlyResults[0].preTaxSalary * 12).toFixed(2));
  const totalFund = parseFloat(monthlyResults.reduce((sum, month) => sum + month.fundDetails.total, 0).toFixed(2));
  const totalTax = parseFloat(monthlyResults.reduce((sum, month) => sum + month.tax, 0).toFixed(2));
  const totalAfterTax = parseFloat(monthlyResults.reduce((sum, month) => sum + month.afterTaxSalary, 0).toFixed(2));
  
  return {
    totalPreTax,
    totalFund,
    totalTax,
    totalAfterTax
  };
}

// 工具函数：合并classNames（原cn函数）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}