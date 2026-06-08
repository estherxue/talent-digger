// 各职业的成功人物范例及职业轨迹，供用户参考

export interface CareerMilestone {
  year: string
  description: string
}

export interface RoleModel {
  name: string
  title: string
  avatar: string // emoji
  description: string
  milestones: CareerMilestone[]
  quote?: string
}

export interface CareerRoleModelData {
  careerName: string
  roleModels: RoleModel[]
}

export const careerRoleModels: CareerRoleModelData[] = [
  // ================================================================
  // 1. 数据分析师
  // ================================================================
  {
    careerName: '数据分析师',
    roleModels: [
      {
        name: '吴恩达（Andrew Ng）',
        title: 'DeepLearning.AI 创始人、前 Google Brain 联合创始人',
        avatar: '🤖',
        description: '全球最具影响力的 AI 与数据科学教育家之一，他的机器学习课程启蒙了数百万数据从业者。',
        milestones: [
          { year: '1997', description: '获卡内基梅隆大学计算机科学学士' },
          { year: '2002', description: '获加州大学伯克利分校博士学位，研究方向为强化学习' },
          { year: '2011', description: '创立 Google Brain，主导大规模深度学习与数据基础设施建设' },
          { year: '2014', description: '加入百度任首席科学家，领导 1300 人的 AI 研究团队' },
          { year: '2017', description: '创立 DeepLearning.AI，推出 Coursera 深度学习专项课程' },
          { year: '2021', description: '创立 Landing AI，推动 AI 在制造业等传统行业的数据驱动转型' },
        ],
        quote: 'AI is the new electricity. Data is the new oil.',
      },
      {
        name: 'D.J. Patil',
        title: '前美国首席数据科学家',
        avatar: '📊',
        description: '被誉为"数据科学之父"，将数据分析从技术岗位提升为国家战略层面的关键角色。',
        milestones: [
          { year: '1996', description: '获马里兰大学应用数学学士' },
          { year: '2001', description: '获马里兰大学应用数学博士学位' },
          { year: '2008', description: '加入 LinkedIn，主导"你可能认识的人"等数据产品的算法设计' },
          { year: '2015', description: '被奥巴马任命为美国首位首席数据科学家，推动政府数据开放' },
          { year: '2019', description: '加入 Venrock 创投，专注于数据驱动型创业公司的投资与指导' },
        ],
        quote: '数据科学不仅是技术问题，更是一种思维方式。',
      },
    ],
  },

  // ================================================================
  // 2. 产品经理
  // ================================================================
  {
    careerName: '产品经理',
    roleModels: [
      {
        name: '张小龙',
        title: '微信创始人、腾讯高级副总裁',
        avatar: '💬',
        description: '被称为"微信之父"，以极致的产品哲学打造了月活超 13 亿的国民级应用。',
        milestones: [
          { year: '1994', description: '毕业于华中科技大学电信系' },
          { year: '1997', description: '独立开发 Foxmail，成为中国最受欢迎的邮件客户端之一' },
          { year: '2000', description: 'Foxmail 被博大公司收购，张小龙随团队加入' },
          { year: '2005', description: '腾讯收购 Foxmail，张小龙加入腾讯负责 QQ 邮箱改版' },
          { year: '2011', description: '推出微信，以"用完即走"的产品理念颠覆即时通讯市场' },
          { year: '2017', description: '推出小程序生态，开创"无需下载、用完即走"的应用新模式' },
        ],
        quote: '好的产品是用完即走的。',
      },
      {
        name: '俞军',
        title: '前百度产品副总裁、滴滴产品顾问',
        avatar: '🔍',
        description: '中国互联网产品经理的标杆人物，提出了"俞军产品经理十二条"经典方法论。',
        milestones: [
          { year: '2000', description: '从传统行业转行，以"搜索爱好者"身份加入百度' },
          { year: '2003', description: '主导百度贴吧产品设计，开创中文社区的新形态' },
          { year: '2006', description: '升任百度产品副总裁，统管全部产品线' },
          { year: '2009', description: '提出"产品经理十二条"，至今仍是行业经典教材' },
          { year: '2016', description: '加入滴滴出行任产品顾问，指导出行产品的精细化运营' },
        ],
        quote: '产品经理的核心能力是发现需求，而不是实现需求。',
      },
    ],
  },

  // ================================================================
  // 3. 软件工程师
  // ================================================================
  {
    careerName: '软件工程师',
    roleModels: [
      {
        name: '雷军',
        title: '小米科技创始人、董事长兼 CEO',
        avatar: '📱',
        description: '中国第一代程序员出身的企业家，从码农到千亿市值公司创始人。',
        milestones: [
          { year: '1991', description: '毕业于武汉大学计算机系，大学期间已出版编程教材' },
          { year: '1992', description: '加入金山软件，成为第 6 号员工' },
          { year: '1998', description: '出任金山软件 CEO，主导 WPS 等核心产品的技术研发' },
          { year: '2007', description: '带领金山软件在香港上市后选择退休' },
          { year: '2010', description: '创立小米科技，以互联网思维改造智能手机行业' },
          { year: '2018', description: '小米集团在香港上市，成为全球最年轻的 500 强企业之一' },
        ],
        quote: '站在风口上，猪都能飞起来。',
      },
      {
        name: '林纳斯·托瓦兹（Linus Torvalds）',
        title: 'Linux 内核与 Git 创始人',
        avatar: '🐧',
        description: '从大学宿舍开始的个人项目，最终成为全球最广泛使用的操作系统内核。',
        milestones: [
          { year: '1991', description: '在赫尔辛基大学读书期间发布 Linux 内核首个版本' },
          { year: '1994', description: '发布 Linux 1.0，采用 GPL 开源协议，吸引全球开发者贡献' },
          { year: '2003', description: '加入 Open Source Development Labs，全职维护 Linux 内核' },
          { year: '2005', description: '为管理 Linux 内核开发，创建 Git 版本控制系统' },
          { year: '2019', description: 'Linux 内核贡献者超过 2 万人，运行在全球 90% 以上的服务器上' },
        ],
        quote: 'Talk is cheap. Show me the code.',
      },
    ],
  },

  // ================================================================
  // 4. UI/UX 设计师
  // ================================================================
  {
    careerName: 'UI/UX设计师',
    roleModels: [
      {
        name: '贾伟',
        title: '洛可可创新设计集团创始人',
        avatar: '🎨',
        description: '中国最具影响力的工业设计师之一，将用户体验设计从概念变为产业。',
        milestones: [
          { year: '2000', description: '毕业于北京理工大学工业设计专业' },
          { year: '2004', description: '创立洛可可设计，从 500 元租工位起步' },
          { year: '2008', description: '主持北京奥运会地铁闸机等多项国家重点项目设计' },
          { year: '2015', description: '推出洛客共享设计平台，打造"设计界的 Uber"' },
          { year: '2018', description: '获德国红点奖、iF 奖等国际设计大奖累计超过 300 项' },
        ],
        quote: '设计不是装饰，是解决问题的方式。',
      },
      {
        name: '唐·诺曼（Don Norman）',
        title: '苹果前高级技术副总裁、《设计心理学》作者',
        avatar: '🧠',
        description: '"用户体验之父"，首次提出 UX 概念并系统化了以人为中心的设计方法论。',
        milestones: [
          { year: '1966', description: '获宾夕法尼亚大学心理学博士学位' },
          { year: '1993', description: '加入苹果公司，担任高级技术副总裁，主导产品用户体验设计' },
          { year: '1988', description: '出版《设计心理学》，奠定人机交互领域的理论基础' },
          { year: '2002', description: '创立尼尔森诺曼集团（NN/g），成为全球领先的用户体验咨询公司' },
          { year: '2013', description: '入选美国国家工程院院士，以表彰其在认知工程领域的贡献' },
        ],
        quote: '好的设计实际上比坏的设计更难被注意到，因为它满足了我们的需求而不引人注目。',
      },
    ],
  },

  // ================================================================
  // 5. 心理咨询师
  // ================================================================
  {
    careerName: '心理咨询师',
    roleModels: [
      {
        name: '武志红',
        title: '资深心理咨询师、作家',
        avatar: '💜',
        description: '中国最具影响力的心理学普及者之一，将心理学从学术圈带入大众视野。',
        milestones: [
          { year: '1996', description: '毕业于北京大学心理学系' },
          { year: '2001', description: '获广州日报杯"最佳专栏奖"，开始心理学科普写作' },
          { year: '2007', description: '出版《为何家会伤人》，销量超百万，引发全民心理学讨论' },
          { year: '2014', description: '创立"看见心理"平台，连接心理咨询师与来访者' },
          { year: '2019', description: '创办"武志红心理"App，累计用户超 500 万' },
        ],
        quote: '看见，就是爱。',
      },
      {
        name: '欧文·亚隆（Irvin D. Yalom）',
        title: '斯坦福大学精神病学终身教授',
        avatar: '📚',
        description: '存在主义心理治疗的代表人物，以文学化的写作让心理治疗为大众所理解。',
        milestones: [
          { year: '1956', description: '获波士顿大学医学院医学博士学位' },
          { year: '1970', description: '出版《团体心理治疗的理论与实践》，成为该领域标准教材' },
          { year: '1980', description: '出版《存在主义心理治疗》，系统阐述面对死亡、自由、孤独的临床方法' },
          { year: '1989', description: '出版心理治疗小说《当尼采哭泣》，登上畅销榜' },
          { year: '2015', description: '出版回忆录《成为我自己》，回顾 60 年心理治疗生涯' },
        ],
        quote: '治疗师和来访者是一段旅途中的同行者。',
      },
    ],
  },

  // ================================================================
  // 6. 项目经理
  // ================================================================
  {
    careerName: '项目经理',
    roleModels: [
      {
        name: '董明珠',
        title: '格力电器董事长兼总裁',
        avatar: '⚡',
        description: '从基层销售成长为千亿企业的掌舵人，以铁腕管理和项目执行力著称。',
        milestones: [
          { year: '1990', description: '加入格力电器（时名海利空调），从基层销售员做起' },
          { year: '1994', description: '临危受命任经营部部长，带领团队重建全国销售体系' },
          { year: '2001', description: '出任格力电器总经理，全面掌管公司运营' },
          { year: '2012', description: '出任格力电器董事长，推行"让世界爱上中国造"战略' },
          { year: '2015', description: '带领格力进入世界 500 强，家用空调全球市占率连续多年第一' },
        ],
        quote: '我从来就没有失误过，我从不认错，我永远是对的。',
      },
      {
        name: '彭蕾',
        title: '蚂蚁金服前董事长、阿里合伙人',
        avatar: '🐜',
        description: '阿里巴巴从 18 人到数万人的组织建设核心推手，被誉为"阿里女丞相"。',
        milestones: [
          { year: '1999', description: '辞去浙江财经学院教师职位，加入阿里巴巴创业团队' },
          { year: '2010', description: '临危受命接任支付宝 CEO，扭转业务颓势' },
          { year: '2013', description: '主导筹建蚂蚁金服集团，担任 CEO' },
          { year: '2018', description: '卸任蚂蚁金服董事长，交棒给年轻一代管理者' },
          { year: '2021', description: '入选福布斯"全球最具影响力女性"榜单' },
        ],
        quote: '管理就是带好团队，让每个人都能发光。',
      },
    ],
  },

  // ================================================================
  // 7. 教师/培训师
  // ================================================================
  {
    careerName: '教师/培训师',
    roleModels: [
      {
        name: '俞敏洪',
        title: '新东方教育集团创始人',
        avatar: '🎓',
        description: '从北大教师到中国民办教育第一人，影响了整整两代中国学生的英语学习和人生选择。',
        milestones: [
          { year: '1980', description: '三次高考后考入北京大学西语系' },
          { year: '1985', description: '毕业后留校任教，成为北大英语教师' },
          { year: '1993', description: '从北大辞职，创办北京新东方学校' },
          { year: '2006', description: '新东方在美国纽交所上市，成为中国教育第一股' },
          { year: '2019', description: '创立东方甄选，带领新东方转型直播电商，帮助农产品销售' },
        ],
        quote: '从绝望中寻找希望，人生终将辉煌。',
      },
      {
        name: '萨尔曼·可汗（Sal Khan）',
        title: '可汗学院创始人',
        avatar: '🌍',
        description: '从给表妹远程辅导数学开始，创立了全球最大的免费在线教育平台。',
        milestones: [
          { year: '2004', description: '为远程辅导表妹数学，开始在 YouTube 上传教学视频' },
          { year: '2006', description: '视频广受欢迎，决定辞去对冲基金分析师工作，全职投入教育' },
          { year: '2009', description: '获微软和 Google 资助，可汗学院正式成为非营利组织' },
          { year: '2015', description: '可汗学院月活用户超 1500 万，提供 36 种语言的教学内容' },
          { year: '2020', description: '疫情期间日均新增用户超 300 万，成为全球最大在线学习平台之一' },
        ],
        quote: '你可以学习任何东西——免费的，面向所有人，永远如此。',
      },
    ],
  },

  // ================================================================
  // 8. 市场营销经理
  // ================================================================
  {
    careerName: '市场营销经理',
    roleModels: [
      {
        name: '杜国楹',
        title: '小罐茶创始人、连续创业者',
        avatar: '🍵',
        description: '中国营销界的"爆品之王"，先后打造了背背佳、好记星、8848 钛金手机、小罐茶等知名品牌。',
        milestones: [
          { year: '1994', description: '从教师转行做销售，积累了丰富的市场实战经验' },
          { year: '1997', description: '创立背背佳，以精准的学生群体定位 3 年销售额破 10 亿' },
          { year: '2003', description: '推出好记星学习机，开创"教育硬件+内容订阅"模式' },
          { year: '2015', description: '创立小罐茶，以高端品牌定位重新定义中国茶叶市场' },
          { year: '2019', description: '小罐茶年销售额突破 20 亿，开创中国茶行业品牌化先河' },
        ],
        quote: '营销的本质不是卖东西，是帮用户做选择。',
      },
      {
        name: '华杉',
        title: '华与华营销咨询创始人',
        avatar: '🏷️',
        description: '中国本土营销理论的奠基者之一，提出了"超级符号"方法论。',
        milestones: [
          { year: '1990', description: '毕业于中国人民大学新闻系' },
          { year: '2002', description: '与弟弟华楠共同创立华与华营销咨询公司' },
          { year: '2008', description: '为厨邦酱油打造"绿格子"超级符号，让品牌知名度飙升' },
          { year: '2013', description: '出版《超级符号就是超级创意》，提出本土化品牌方法论' },
          { year: '2020', description: '服务客户包括海底捞、西贝、得到等超 200 家知名品牌' },
        ],
        quote: '品牌就是符号，符号就是品牌。',
      },
    ],
  },

  // ================================================================
  // 9. 科研人员
  // ================================================================
  {
    careerName: '科研人员',
    roleModels: [
      {
        name: '屠呦呦',
        title: '诺贝尔生理学或医学奖获得者',
        avatar: '🔬',
        description: '中国首位诺贝尔科学奖得主，从古籍中发掘出青蒿素，拯救了数百万疟疾患者的生命。',
        milestones: [
          { year: '1955', description: '毕业于北京医学院（现北京大学医学部）药学系' },
          { year: '1969', description: '39 岁时受命担任"抗疟中草药研究"课题组组长' },
          { year: '1972', description: '从《肘后备急方》中获得启发，成功提取青蒿素' },
          { year: '1986', description: '青蒿素类药物治疗疟疾在全球推广' },
          { year: '2015', description: '以 85 岁高龄获诺贝尔生理学或医学奖，终身未获院士头衔' },
        ],
        quote: '没有行不行，只有肯不肯坚持。',
      },
      {
        name: '袁隆平',
        title: '"杂交水稻之父"、中国工程院院士',
        avatar: '🌾',
        description: '用一粒种子改变了世界，让数亿人免于饥饿。从田间地头走出了一条伟大的科研之路。',
        milestones: [
          { year: '1953', description: '毕业于西南农学院（现西南大学）农学系' },
          { year: '1964', description: '在稻田中发现天然雄性不育株，开启杂交水稻研究' },
          { year: '1973', description: '成功实现籼型杂交水稻"三系"配套，亩产大幅提升' },
          { year: '1995', description: '两系法杂交水稻研究成功，进一步简化制种流程' },
          { year: '2020', description: '第三代杂交水稻双季亩产突破 1500 公斤，创世界纪录' },
        ],
        quote: '人就像一粒种子，要做一粒好种子。',
      },
    ],
  },

  // ================================================================
  // 10. 创业/自由职业者
  // ================================================================
  {
    careerName: '创业/自由职业者',
    roleModels: [
      {
        name: '马云',
        title: '阿里巴巴集团创始人',
        avatar: '🚀',
        description: '从英语教师到全球电商帝国缔造者，中国最具代表性的连续创业者。',
        milestones: [
          { year: '1988', description: '毕业于杭州师范学院英语专业，成为一名大学英语教师' },
          { year: '1995', description: '创办中国黄页，第一次创业，虽失败但积累了互联网经验' },
          { year: '1999', description: '在杭州湖畔花园公寓创立阿里巴巴，18 人团队起步' },
          { year: '2014', description: '阿里巴巴在纽交所上市，创全球最大 IPO 纪录' },
          { year: '2019', description: '卸任阿里巴巴董事局主席，投身公益和教育事业' },
        ],
        quote: '今天很残酷，明天更残酷，后天很美好。',
      },
      {
        name: '雷军',
        title: '小米科技创始人',
        avatar: '📱',
        description: '从程序员到企业家再到投资人，以"专注、极致、口碑、快"七字诀打造了小米模式。',
        milestones: [
          { year: '1991', description: '毕业于武汉大学计算机系，两年修完四年学分' },
          { year: '1992', description: '加入金山软件，从程序员做到 CEO' },
          { year: '2007', description: '带领金山上市后退休，转型天使投资人，投资 YY、UC 等明星项目' },
          { year: '2010', description: '40 岁重新出发，创立小米科技，开创互联网手机模式' },
          { year: '2024', description: '宣布小米汽车 SU7 上市，从手机跨界到智能电动汽车制造' },
        ],
        quote: '人因梦想而伟大，又因坚持梦想而成长。',
      },
    ],
  },

  // ================================================================
  // 11. 文案/内容创作者
  // ================================================================
  {
    careerName: '文案/内容创作者',
    roleModels: [
      {
        name: '罗振宇',
        title: '得到 App 创始人、《罗辑思维》主讲人',
        avatar: '🎙️',
        description: '从传统媒体人转型为知识服务创业者，开创了"知识付费"这一全新赛道。',
        milestones: [
          { year: '2004', description: '在中国传媒大学攻读博士期间，在央视担任《对话》栏目制片人' },
          { year: '2012', description: '推出《罗辑思维》脱口秀，以"有种、有趣、有料"的内容风格迅速走红' },
          { year: '2015', description: '在微信公众号上发起"会员招募"，24 小时入账 800 万，验证知识付费模式' },
          { year: '2016', description: '推出"得到"App，邀请薛兆丰、万维钢等顶级学者开设专栏' },
          { year: '2020', description: '得到 App 用户超 4000 万，年营收突破 10 亿' },
        ],
        quote: '做时间的朋友。',
      },
      {
        name: '樊登',
        title: '樊登读书创始人',
        avatar: '📖',
        description: '从大学教师到影响 6000 万人的阅读推广者，以讲书为产品重新定义了内容传播方式。',
        milestones: [
          { year: '2001', description: '获西安交通大学管理学硕士学位，留校任教' },
          { year: '2013', description: '在微信群里用语音给朋友讲书，意外发现巨大需求' },
          { year: '2015', description: '正式创立"樊登读书会"，以"一年读 50 本书"为口号' },
          { year: '2019', description: '樊登读书注册用户突破 2000 万' },
          { year: '2023', description: '用户超 6000 万，成为全球最大的知识服务品牌之一' },
        ],
        quote: '读书点亮生活。',
      },
    ],
  },

  // ================================================================
  // 12. 人力资源经理
  // ================================================================
  {
    careerName: '人力资源经理',
    roleModels: [
      {
        name: '彭蕾',
        title: '阿里巴巴集团前首席人才官、蚂蚁金服前董事长',
        avatar: '👥',
        description: '阿里巴巴"十八罗汉"之一，从 0 到 1 搭建了阿里的人才体系和企业文化。',
        milestones: [
          { year: '1999', description: '加入阿里巴巴，成为第 7 号员工，负责招聘和行政' },
          { year: '2005', description: '出任阿里集团首席人才官（CPO），建立阿里政委体系' },
          { year: '2010', description: '推出阿里巴巴"合伙人制度"，保障公司治理和文化传承' },
          { year: '2013', description: '主导阿里人才盘点体系，以"闻味道"法评估文化匹配度' },
          { year: '2021', description: '入选福布斯"全球最具影响力女性"榜单，排名第 7 位' },
        ],
        quote: '文化不是贴在墙上的口号，是每个人做决策时的本能反应。',
      },
      {
        name: '戴维·尤里奇（Dave Ulrich）',
        title: '现代人力资源管理之父',
        avatar: '📋',
        description: '全球最具影响力的人力资源思想家，提出了 HR 业务伙伴（HRBP）模型。',
        milestones: [
          { year: '1980', description: '获加州大学洛杉矶分校管理学博士学位' },
          { year: '1997', description: '出版《人力资源冠军》，首次提出 HR 四个角色模型' },
          { year: '2008', description: '提出"由外而内的 HR"理念，推动 HR 职能从行政服务转向业务驱动' },
          { year: '2016', description: '被 HR Magazine 评选为"最具影响力的 HR 思想家"第一名' },
          { year: '2021', description: '出版《HR 转型》，全球累计销量超百万册，成为 HR 行业圣经' },
        ],
        quote: 'HR 的价值不在于做了什么，而在于带来了什么结果。',
      },
    ],
  },

  // ================================================================
  // 13. 咨询顾问
  // ================================================================
  {
    careerName: '咨询顾问',
    roleModels: [
      {
        name: '马文·鲍尔（Marvin Bower）',
        title: '麦肯锡公司创始合伙人',
        avatar: '🏢',
        description: '将"管理咨询"从零打造为一个全球行业，定义了咨询顾问的专业标准和价值观。',
        milestones: [
          { year: '1928', description: '获哈佛法学院法学博士学位' },
          { year: '1933', description: '加入麦肯锡公司（原为会计事务所）' },
          { year: '1939', description: '接手麦肯锡并重塑为纯管理咨询公司，坚持"只为企业一把手服务"' },
          { year: '1953', description: '为麦肯锡制定核心原则："客户利益至上、说真话、只做正确的事"' },
          { year: '2003', description: '以 99 岁高龄去世，麦肯锡已发展为全球最大的战略咨询公司' },
        ],
        quote: '管理咨询的使命不是告诉客户该做什么，而是帮助他们做出更明智的决策。',
      },
      {
        name: '刘强东',
        title: '京东集团创始人',
        avatar: '🛒',
        description: '从实体店到电商巨头，再到战略咨询级的企业管理——他的经历本身就是一部商业教科书。',
        milestones: [
          { year: '1996', description: '毕业于中国人民大学社会学系' },
          { year: '1998', description: '在中关村摆柜台卖光磁产品，开始创业' },
          { year: '2004', description: '转型线上，创立京东多媒体网（京东商城前身）' },
          { year: '2007', description: '力排众议自建物流体系，成为京东核心竞争力' },
          { year: '2014', description: '京东在纳斯达克上市，市值超 300 亿美元' },
        ],
        quote: '所有的失败，最终都是人的失败。',
      },
    ],
  },

  // ================================================================
  // 14. 运营经理
  // ================================================================
  {
    careerName: '运营经理',
    roleModels: [
      {
        name: '王慧文',
        title: '美团联合创始人、前高级副总裁',
        avatar: '🏍️',
        description: '美团从"千团大战"中杀出重围的关键人物，被誉为中国互联网最强运营操盘手之一。',
        milestones: [
          { year: '2001', description: '毕业于清华大学电子工程系' },
          { year: '2010', description: '与王兴联合创立美团网，负责运营和销售体系搭建' },
          { year: '2011', description: '主导美团"千团大战"地面推广，用极致的执行效率淘汰上千家竞争对手' },
          { year: '2015', description: '美团与大众点评合并后，负责到店事业群，年交易额破千亿' },
          { year: '2020', description: '以"退休"状态离开美团，留下"干嘉伟-王慧文"运营方法论' },
        ],
        quote: '运营就是把正确的事情重复做，做到极致。',
      },
      {
        name: '张勇',
        title: '海底捞 CEO',
        avatar: '🍲',
        description: '以极致服务体验闻名全球的餐饮运营典范，将"服务"做成了海底捞的核心竞争力。',
        milestones: [
          { year: '1994', description: '加入海底捞，从最基层的服务员做起' },
          { year: '2002', description: '升任海底捞副总经理，推行标准化运营流程' },
          { year: '2011', description: '推出"师徒制"门店扩张模式，每家新店由老员工培养的徒弟打理' },
          { year: '2018', description: '海底捞在香港上市，全球门店超 400 家，市值破千亿港元' },
          { year: '2023', description: '海底捞全球门店超 1300 家，以极致服务体验成为全球餐饮标杆' },
        ],
        quote: '只要顾客需要，我们就要想办法满足。',
      },
    ],
  },

  // ================================================================
  // 15. 销售经理
  // ================================================================
  {
    careerName: '销售经理',
    roleModels: [
      {
        name: '董明珠',
        title: '格力电器董事长兼总裁',
        avatar: '⚡',
        description: '从基层销售员到千亿企业掌门人，以卓越的销售能力和铁腕管理铸就了格力帝国。',
        milestones: [
          { year: '1990', description: '加入格力电器（时名海利空调），从最基层销售做起' },
          { year: '1992', description: '个人销售额突破 1600 万，占公司总销售额的 1/8' },
          { year: '1994', description: '被推举为经营部部长，推行"先款后货"制度，杜绝经销商拖欠货款' },
          { year: '2001', description: '全面执掌格力，推行"区域性销售公司"模式，建立自有渠道' },
          { year: '2019', description: '格力电器年营收破 2000 亿，家用空调全球市占率第一' },
        ],
        quote: '没有业绩就没有尊严。',
      },
      {
        name: '李嘉诚',
        title: '长江实业集团创始人',
        avatar: '🏗️',
        description: '从钟表店推销员到亚洲首富，以诚信为根基建立起跨越半个世纪的商业帝国。',
        milestones: [
          { year: '1943', description: '15 岁时父亲去世，辍学到钟表公司做推销员养家' },
          { year: '1950', description: '以 5 万港元积蓄创办长江塑胶厂（长江实业前身）' },
          { year: '1958', description: '抓住香港地产机遇，转型房地产，建立"低买高卖"的投资哲学' },
          { year: '1979', description: '收购和记黄埔，成为首位收购英资大行的华人企业家' },
          { year: '1999', description: '以 126 亿美元身家成为亚洲首富，保持该头衔长达 15 年' },
        ],
        quote: '在 20 岁前，事业上的成功百分之百靠双手勤劳换来；20 到 30 岁，事业已有些基础，10% 靠运气好。',
      },
    ],
  },
]

/** 根据职业名称获取角色模型数据 */
export function getRoleModels(careerName: string): RoleModel[] {
  const entry = careerRoleModels.find(c => c.careerName === careerName)
  return entry?.roleModels || []
}

/** 根据职业名称获取完整的职业+角色模型数据 */
export function getCareerWithRoleModels(careerName: string): CareerRoleModelData | undefined {
  return careerRoleModels.find(c => c.careerName === careerName)
}
