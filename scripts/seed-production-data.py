#!/usr/bin/env python3
"""
生产环境测试数据导入脚本

这个脚本会将测试数据导入到生产环境的 Firestore
使用 Firebase Admin SDK 直接连接到生产环境

警告: 这会向生产环境写入真实数据！
"""

import sys
import os
from datetime import datetime

# 添加 functions 目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions'))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("❌ 错误: 需要安装 firebase-admin")
    print("请运行: pip install firebase-admin")
    sys.exit(1)


def init_firebase():
    """初始化 Firebase Admin SDK - 连接到生产环境"""

    # 检查是否已经初始化
    try:
        firebase_admin.get_app()
        print("ℹ️  Firebase 已经初始化")
        return firestore.client()
    except ValueError:
        pass

    # 清除可能存在的错误环境变量
    if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
        print("ℹ️  清除旧的 GOOGLE_APPLICATION_CREDENTIALS 环境变量")
        del os.environ['GOOGLE_APPLICATION_CREDENTIALS']

    # 使用项目 ID 直接初始化
    # 这会使用 Firebase CLI 登录的认证
    try:
        # 明确指定项目 ID
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': 'autodocgen-prod',
        })
        print("✓ Firebase 初始化成功 (使用 Firebase CLI 认证)")
        return firestore.client()
    except Exception as e:
        print(f"❌ Firebase 初始化失败: {e}")
        print("\n请确保:")
        print("1. 已安装 Firebase CLI: npm install -g firebase-tools")
        print("2. 已登录: firebase login")
        print("3. 已选择项目: firebase use autodocgen-prod")
        print("\n或者运行:")
        print("   gcloud auth application-default login")
        sys.exit(1)


def confirm_production(skip_confirm=False):
    """确认用户知道这是生产环境"""
    print("\n" + "="*60)
    print("⚠️  警告: 这将向生产环境写入数据！")
    print("="*60)
    print("\n当前项目: autodocgen-prod")
    print("环境: 生产环境 (Production)")
    print("\n这个脚本会创建:")
    print("  • 3 个公司")
    print("  • 4 个联系人")
    print("  • 3 个模板")
    print("  • 2 个示例项目")
    print("\n")

    if skip_confirm:
        print("✓ 跳过确认 (--yes 参数)")
        print("\n✓ 开始导入数据...\n")
        return

    response = input("确定要继续吗？(输入 'yes' 继续): ").strip().lower()

    if response != 'yes':
        print("\n❌ 已取消操作")
        sys.exit(0)

    print("\n✓ 已确认，开始导入数据...\n")


def create_companies(db):
    """创建测试公司"""
    print("📊 创建公司数据...")

    companies_data = [
        {
            'company_name': '测试科技有限公司',
            'address': '台北市信义区信义路五段7号',
            'phone': '02-2345-6789',
            'email': 'info@test-tech.com',
            'tax_id': '12345678',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'company_name': '创新设计股份有限公司',
            'address': '台北市中山区南京东路三段168号',
            'phone': '02-8765-4321',
            'email': 'contact@innovation-design.com',
            'tax_id': '87654321',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'company_name': '智能解决方案有限公司',
            'address': '新北市板桥区文化路一段188号',
            'phone': '02-2222-3333',
            'email': 'service@smart-solutions.com',
            'tax_id': '11223344',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        }
    ]

    company_refs = []
    for company_data in companies_data:
        doc_ref = db.collection('companies').document()
        doc_ref.set(company_data)
        company_refs.append(doc_ref)
        print(f"  ✓ 创建公司: {company_data['company_name']} (ID: {doc_ref.id})")

    return company_refs


def create_contacts(db, company_refs):
    """创建测试联系人"""
    print("\n📊 创建联系人数据...")

    contacts_data = [
        {
            'contact_name': '张三',
            'email': 'zhang.san@test-tech.com',
            'phone': '0912-345-678',
            'position': '项目经理',
            'company_ref': company_refs[0].path,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'contact_name': '李四',
            'email': 'li.si@test-tech.com',
            'phone': '0923-456-789',
            'position': '技术总监',
            'company_ref': company_refs[0].path,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'contact_name': '王五',
            'email': 'wang.wu@innovation-design.com',
            'phone': '0934-567-890',
            'position': '设计主管',
            'company_ref': company_refs[1].path,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'contact_name': '赵六',
            'email': 'zhao.liu@smart-solutions.com',
            'phone': '0945-678-901',
            'position': '业务经理',
            'company_ref': company_refs[2].path,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        }
    ]

    contact_refs = []
    for contact_data in contacts_data:
        doc_ref = db.collection('contacts').document()
        doc_ref.set(contact_data)
        contact_refs.append(doc_ref)
        print(f"  ✓ 创建联系人: {contact_data['contact_name']} ({contact_data['position']})")

    return contact_refs


def create_templates(db):
    """创建测试模板"""
    print("\n📊 创建模板数据...")

    templates_data = [
        {
            'template_name': '标准报价单',
            'template_type': 'quotation',
            'description': '适用于一般项目的标准报价单模板',
            'fields': ['payment_terms', 'delivery_date', 'warranty_period', 'notes'],
            'field_labels': {
                'payment_terms': '付款条件',
                'delivery_date': '交付日期',
                'warranty_period': '保固期限',
                'notes': '备注'
            },
            'is_active': True,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'template_name': '合约书模板',
            'template_type': 'contract',
            'description': '正式合约文件模板',
            'fields': ['contract_start_date', 'contract_end_date', 'payment_terms', 'special_terms'],
            'field_labels': {
                'contract_start_date': '合约开始日期',
                'contract_end_date': '合约结束日期',
                'payment_terms': '付款条件',
                'special_terms': '特殊条款'
            },
            'is_active': True,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        },
        {
            'template_name': '发票模板',
            'template_type': 'invoice',
            'description': '标准发票模板',
            'fields': ['invoice_date', 'due_date', 'payment_method', 'bank_account'],
            'field_labels': {
                'invoice_date': '发票日期',
                'due_date': '到期日',
                'payment_method': '付款方式',
                'bank_account': '银行账号'
            },
            'is_active': True,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
        }
    ]

    template_refs = []
    for template_data in templates_data:
        doc_ref = db.collection('templates').document()
        doc_ref.set(template_data)
        template_refs.append(doc_ref)
        print(f"  ✓ 创建模板: {template_data['template_name']} ({template_data['template_type']})")

    return template_refs


def create_sample_projects(db, company_refs, contact_refs, template_refs):
    """创建示例项目"""
    print("\n📊 创建示例项目...")

    projects_data = [
        {
            'project_name': '网站重新设计专案',
            'company_ref': company_refs[0].path,
            'contact_ref': contact_refs[0].path,
            'price': 250000,
            'date': '2025-10-28',
            'status': 'in_progress',
            'document_number': 'HIYES25JAB001',  # 示例编号
            'extra_data': {
                'payment_terms': '专案完成后 30 天内付款',
                'delivery_date': '2025-12-31',
                'warranty_period': '6个月',
                'notes': '包含 RWD 响应式设计'
            },
            'status_history': [
                {
                    'status': 'draft',
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'updated_by': 'system'
                },
                {
                    'status': 'in_progress',
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'updated_by': 'system'
                }
            ],
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': 'system'
        },
        {
            'project_name': '品牌识别设计',
            'company_ref': company_refs[1].path,
            'contact_ref': contact_refs[2].path,
            'price': 180000,
            'date': '2025-10-28',
            'status': 'pending_invoice',
            'document_number': 'HIYES25JAB002',  # 示例编号
            'extra_data': {
                'payment_terms': '签约时支付 50%，完成时支付 50%',
                'delivery_date': '2025-11-30',
                'warranty_period': '3个月',
                'notes': '包含 Logo、名片、信纸等'
            },
            'status_history': [
                {
                    'status': 'draft',
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'updated_by': 'system'
                },
                {
                    'status': 'in_progress',
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'updated_by': 'system'
                },
                {
                    'status': 'pending_invoice',
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'updated_by': 'system'
                }
            ],
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'created_by': 'system'
        }
    ]

    project_refs = []
    for project_data in projects_data:
        doc_ref = db.collection('projects').document()
        doc_ref.set(project_data)
        project_refs.append(doc_ref)
        print(f"  ✓ 创建项目: {project_data['project_name']} (状态: {project_data['status']})")

    return project_refs


def print_summary(company_refs, contact_refs, template_refs, project_refs):
    """打印导入总结"""
    print("\n" + "="*60)
    print("✅ 测试数据导入完成！")
    print("="*60)
    print(f"\n✓ 公司: {len(company_refs)} 个")
    print(f"✓ 联系人: {len(contact_refs)} 个")
    print(f"✓ 模板: {len(template_refs)} 个")
    print(f"✓ 项目: {len(project_refs)} 个")

    print("\n" + "="*60)
    print("📍 查看数据")
    print("="*60)
    print("\n🌐 Firestore Console:")
    print("   https://console.firebase.google.com/project/autodocgen-prod/firestore")

    print("\n🌐 前端应用:")
    print("   https://autodocgen-prod.web.app")

    print("\n" + "="*60)
    print("🎯 下一步")
    print("="*60)
    print("\n1. 访问前端应用")
    print("2. 查看已创建的项目")
    print("3. 尝试创建新项目")
    print("4. 测试所有功能")

    print("\n💡 提示:")
    print("   • 这些是测试数据，可以随时删除")
    print("   • 如需添加更多数据，可以重复运行此脚本")
    print("   • 或在 Firebase Console 手动添加")
    print()


def main():
    """主函数"""
    print("\n" + "="*60)
    print("  AutoDocGen 生产环境测试数据导入工具")
    print("="*60)

    # 检查命令行参数
    skip_confirm = '--yes' in sys.argv or '-y' in sys.argv

    # 确认操作
    confirm_production(skip_confirm)

    # 初始化 Firebase
    db = init_firebase()

    try:
        # 创建数据
        company_refs = create_companies(db)
        contact_refs = create_contacts(db, company_refs)
        template_refs = create_templates(db)
        project_refs = create_sample_projects(db, company_refs, contact_refs, template_refs)

        # 打印总结
        print_summary(company_refs, contact_refs, template_refs, project_refs)

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
