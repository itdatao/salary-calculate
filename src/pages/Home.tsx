import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  formatCurrency, 
  generateMonthlyResults, 
  calculateAnnualSummary 
} from '@/lib/utils';

// 专项附加扣除选项类型定义
interface DeductionItem {
  id: string;
  name: string;
  amount: number;
  enabled: boolean;
}

// 五险一金计算主页面
export default function Home() {
  // 状态管理
  const [salary, setSalary] = useState<string>('10000');
  const [fundRatio, setFundRatio] = useState<number>(10);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // 专项附加扣除状态
  const [deductions, setDeductions] = useState<DeductionItem[]>([
    { id: 'children', name: '子女教育', amount: 1000, enabled: false },
    { id: 'education', name: '继续教育', amount: 400, enabled: false },
    { id: 'housingLoan', name: '住房贷款利息', amount: 1000, enabled: false },
    { id: 'housingRent', name: '住房租金', amount: 1500, enabled: false },
    { id: 'elderly', name: '赡养老人', amount: 2000, enabled: false },
  ]);

  // 处理薪资输入变化
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 允许数字和小数点，最多两位小数
    if (/^\d*(\.\d{0,2})?$/.test(value) || value === '') {
      setSalary(value);
      setError('');
    }
  };

  // 处理公积金比例变化
  const handleFundRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 5 && value <= 12) {
      setFundRatio(value);
    }
  };

  // 处理专项附加扣除变化
  const toggleDeduction = (id: string) => {
    setDeductions(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // 处理专项附加扣除金额自定义
  const handleDeductionAmountChange = (id: string, value: string) => {
    const amount = parseInt(value);
    if (!isNaN(amount) && amount >= 0) {
      setDeductions(prev => 
        prev.map(item => 
          item.id === id ? { ...item, amount } : item
        )
      );
    }
  };

  // 计算专项附加扣除总额
  const getTotalDeductions = () => {
    return deductions.reduce((sum, item) => 
      item.enabled ? sum + item.amount : sum, 0);
  };

  // 计算五险一金和个税
  const calculate = () => {
    // 验证输入
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum <= 0 || salaryNum > 100000) {
      setError('请输入有效的月薪（0-100000）');
      return;
    }

    setIsCalculating(true);
    setError('');
    
    // 模拟计算延迟，增加加载动画效果
    setTimeout(() => {
      // 计算专项附加扣除总额
      const specialDeductions = getTotalDeductions();
      
      // 使用工具函数生成月度结果
       // 2023年北京社保和公积金缴费基数上限为31884元
       const socialSecurityBaseLimit = 31884;
       const housingFundBaseLimit = 31884;
       
       const monthlyResults = generateMonthlyResults(
         salaryNum, 
         fundRatio,
         specialDeductions,
         socialSecurityBaseLimit,
         housingFundBaseLimit
       );
      
      // 使用工具函数计算年度汇总
      const annualSummary = calculateAnnualSummary(monthlyResults);
      
      // 更新状态
      setResults(monthlyResults);
      setSummary(annualSummary);
      setIsCalculating(false);
    }, 800); // 800ms延迟，模拟计算过程
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 */}
      <header className="py-8 px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mb-2"
        >
          五险一金计算器
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          专业、准确的五险一金及个人所得税计算工具，帮助您清晰了解薪资构成
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* 输入区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <i className="fa-solid fa-calculator text-blue-600 dark:text-blue-400 mr-2"></i>
            薪资信息输入
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 月薪输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                每月薪资 (元)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <i className="fa-solid fa-yen-sign"></i>
                </span>
                <input
                  type="text"
                  value={salary}
                  onChange={handleSalaryChange}
                  onBlur={() => {
                    if (!salary) setSalary('0');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                  placeholder="请输入月薪"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                支持整数或小数，例如：10000 或 12500.50
              </p>
            </div>
            
            {/* 公积金比例 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                公积金缴纳比例 ({fundRatio}%)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="12"
                  value={fundRatio}
                  onChange={handleFundRatioChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                  type="number"
                  min="5"
                  max="12"
                  value={fundRatio}
                  onChange={handleFundRatioChange}
                  className="w-16 pl-2 pr-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                可通过滑块或直接输入调整（5%-12%）
              </p>
            </div>
          </div>
          
          {/* 专项附加扣除 */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              专项附加扣除 (元/月)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deductions.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-750">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={item.enabled}
                    onChange={() => toggleDeduction(item.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor={item.id} className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {item.name}
                  </label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleDeductionAmountChange(item.id, e.target.value)}
                    disabled={!item.enabled}
                    className="w-20 pl-2 pr-1 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              根据最新个税政策，选择适用的专项附加扣除项目
            </p>
          </div>
          
          {error && (
            <div className="mt-4 text-red-500 text-sm flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {error}
            </div>
          )}
          
          {/* 计算按钮 */}
          <div className="mt-8 text-center">
            <motion.button
              onClick={calculate}
              disabled={isCalculating || !salary || parseFloat(salary) <= 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isCalculating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  计算中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-calculator mr-2"></i>
                  开始计算
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
        
        {/* 结果展示区域 */}
        {results.length > 0 && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <i className="fa-solid fa-table text-blue-600 dark:text-blue-400 mr-2"></i>
                年度薪资明细
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                基于月薪 {formatCurrency(parseFloat(salary))} 和公积金缴纳比例 {fundRatio}% 计算
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      月份
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      税前薪资
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      五险一金
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      个人所得税
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      税后薪资
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((month, index) => (
                    <motion.tr 
                      key={month.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {month.month}月
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatCurrency(month.preTaxSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatCurrency(month.fundDetails.total)}
                        <div className="text-xs text-gray-400 mt-1">
                          <span className="mr-2">养老: {formatCurrency(month.fundDetails.pension).replace('¥', '')}</span>
                          <span className="mr-2">医疗: {formatCurrency(month.fundDetails.medical).replace('¥', '')}</span>
                          <span className="mr-2">失业: {formatCurrency(month.fundDetails.unemployment).replace('¥', '')}</span>
                          <span>公积金: {formatCurrency(month.fundDetails.housingFund).replace('¥', '')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatCurrency(month.tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(month.afterTaxSalary)}
                      </td>
                    </motion.tr>
                  ))}
                  
                  {/* 年度汇总行 */}
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-gray-100 dark:bg-gray-700 font-bold"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      年度汇总
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalPreTax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalFund)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalTax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                      {formatCurrency(summary.totalAfterTax)}
                    </td>
                  </motion.tr>
                </tbody>
              </table>
            </div>
            
            {/* 说明信息和导出按钮 */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 md:mb-0">计算说明</h3>
                
                <motion.button
                  onClick={() => {
                    // 生成CSV内容
                     // 添加UTF-8 BOM以解决中文编码问题
                     let csvContent = "\ufeff月份,税前薪资,养老保险,医疗保险,失业保险,住房公积金,五险一金合计,个人所得税,税后薪资\n";
                     
                     results.forEach(month => {
                       csvContent += `${month.month}月,`;
                       csvContent += `${month.preTaxSalary},`;
                       csvContent += `${month.fundDetails.pension},`;
                       csvContent += `${month.fundDetails.medical},`;
                       csvContent += `${month.fundDetails.unemployment},`;
                       csvContent += `${month.fundDetails.housingFund},`;
                       csvContent += `${month.fundDetails.total},`;
                       csvContent += `${month.tax},`;
                       csvContent += `${month.afterTaxSalary}\n`;
                     });
                     
                     // 添加年度汇总
                     csvContent += "年度汇总,";
                     csvContent += `${summary.totalPreTax},,,,`;
                     csvContent += `${summary.totalFund},,`;
                     csvContent += `${summary.totalTax},`;
                     csvContent += `${summary.totalAfterTax}\n`;
                    
                    // 创建Blob并下载
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `五险一金计算结果_${new Date().toLocaleDateString()}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow flex items-center transition duration-200"
                >
                  <i className="fa-solid fa-download mr-2"></i>
                  导出CSV
                </motion.button>
              </div>
              
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-start">
                  <i className="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
                  <span>五险一金计算标准：养老保险8%，医疗保险2%，失业保险0.5%，公积金{fundRatio}%（个人缴纳部分）</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
                  <span>个人所得税计算基于最新个税政策，起征点5000元，采用超额累进税率</span>
                </li>
                {getTotalDeductions() > 0 && (
                  <li className="flex items-start">
                    <i className="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
                    <span>已应用专项附加扣除：{formatCurrency(getTotalDeductions())}/月</span>
                  </li>
                )}
                <li className="flex items-start">
                  <i className="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
                  <span>本计算器结果仅供参考，实际缴纳金额以当地社保部门计算为准</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
        
        {/* 初始状态提示 */}
        {!isCalculating && results.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-calculator text-3xl text-blue-500 dark:text-blue-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">尚未进行计算</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              请在上方输入您的月薪和公积金缴纳比例，然后点击"开始计算"按钮获取详细的薪资明细
            </p>
          </div>
        )}
      </main>

      <footer className="py-6 px-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800 mt-12">
        <p>五险一金计算器 &copy; {new Date().getFullYear()} - 专业的薪资计算工具</p>
      </footer>
    </div>
  );
}