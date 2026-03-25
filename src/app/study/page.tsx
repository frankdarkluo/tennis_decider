"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logEvent } from "@/lib/eventLogger";
import { RESEARCH_CONTACT_EMAIL } from "@/lib/researchConfig";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const STUDY_CONSENT_KEY = "study_consent_given";

const steps = [
  {
    title: "步骤 1：先自己搜一搜（约 3 分钟）",
    description: "想一个你最近打球遇到的真实问题。先打开小红书或 B 站，用你自己的方式搜索这个问题，记住你花了多长时间、找到的内容是否有帮助。"
  },
  {
    title: "步骤 2：做一次水平评估（约 2 分钟）",
    description: "先做一次快速评估，让系统知道你的大概能力区间。",
    href: "/assessment",
    cta: "去做评估"
  },
  {
    title: "步骤 3：用一句话描述你的问题（约 2 分钟）",
    description: "把刚才那个真实问题输入进去，看看系统给你的诊断和推荐。",
    href: "/diagnose",
    cta: "去诊断"
  },
  {
    title: "步骤 4：看看推荐的内容（约 3 分钟）",
    description: "点开系统推荐的内容，快速浏览一下，并和你自己在步骤 1 找到的内容比较。"
  },
  {
    title: "步骤 5：生成训练计划（约 1 分钟）",
    description: "在诊断结果页点“生成训练计划”，看看 7 天计划是不是像真的能拿去练。"
  },
  {
    title: "步骤 6：逛逛内容库和博主榜（约 2 分钟）",
    description: "再多看几条内容和创作者，判断推荐范围够不够广。",
    links: [
      { href: "/library", label: "去内容库" },
      { href: "/rankings", label: "去博主榜" }
    ]
  },
  {
    title: "步骤 7：填写反馈问卷（约 5 分钟）",
    description: "最后请完成问卷，告诉我们你真实的体验。",
    href: "/survey",
    cta: "填写问卷"
  }
];

export default function StudyPage() {
  const router = useRouter();
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    const hasConsent = window.localStorage.getItem(STUDY_CONSENT_KEY) === "true";
    setConsentOpen(!hasConsent);
    setConsentReady(hasConsent);
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(STUDY_CONSENT_KEY, "true");
    logEvent("study_consent", { consentGiven: true });
    setConsentOpen(false);
    setConsentReady(true);
  };

  const handleDecline = () => {
    setConsentOpen(false);
    router.replace("/");
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">用户测试流程</p>
          <h1 className="text-3xl font-black text-slate-900">欢迎参加 TennisLevel 用户体验测试</h1>
          <p className="text-sm leading-6 text-slate-600">
            感谢你愿意花 15-20 分钟帮我们测试这个产品。请按下面的步骤操作，不需要着急，按自己的节奏来就好。
          </p>
        </Card>

        {consentReady ? (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {index + 1}/7
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">{step.description}</p>
                {step.href ? (
                  <Link
                    href={step.href}
                    onClick={() => logEvent("cta_click", { ctaLabel: step.cta, ctaLocation: "study", targetPage: step.href })}
                  >
                    <Button>{step.cta}</Button>
                  </Link>
                ) : null}
                {step.links ? (
                  <div className="flex flex-wrap gap-2">
                    {step.links.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => logEvent("cta_click", { ctaLabel: item.label, ctaLocation: "study", targetPage: item.href })}
                      >
                        <Button variant="secondary">{item.label}</Button>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <Modal open={consentOpen} onClose={handleDecline} title="用户体验研究知情同意书">
        <div className="space-y-4 text-sm leading-6 text-slate-700">
          <div>
            <p className="font-semibold text-slate-900">研究目的</p>
            <p>我们正在研究如何帮助业余网球学习者更高效地找到适合自己的训练内容和方法。本次测试旨在了解你使用 TennisLevel 平台的体验。</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">你需要做什么</p>
            <ul className="list-disc pl-5">
              <li>使用 TennisLevel 平台完成评估、诊断和内容浏览（约 15 分钟）</li>
              <li>填写一份简短的反馈问卷（约 5 分钟）</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">数据收集与隐私</p>
            <ul className="list-disc pl-5">
              <li>我们会记录你在平台上的操作行为（如点击、页面停留时间）</li>
              <li>问卷回答将被匿名保存</li>
              <li>你的操作行为数据不会与你的个人身份关联</li>
              <li>所有数据仅用于学术研究，不会用于商业目的</li>
              <li>测试过程可能会被录屏（仅在你另行口头同意后）</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">自愿参与</p>
            <ul className="list-disc pl-5">
              <li>你可以随时退出测试，无需给出理由</li>
              <li>退出不会对你产生任何影响</li>
              <li>你可以要求我们删除你的数据</li>
            </ul>
          </div>
          <p>如有疑问，请联系研究者：{RESEARCH_CONTACT_EMAIL}</p>

          <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] px-4 py-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>我已阅读并理解以上内容，同意参加本次研究</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAccept} disabled={!consentChecked}>开始测试</Button>
            <Button variant="secondary" onClick={handleDecline}>不同意并返回首页</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
