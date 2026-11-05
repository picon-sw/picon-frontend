import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import arrowRightIcon from '../assets/icons/explore/ai/arrow-right.svg';
import arrowUpLeftIcon from '../assets/icons/explore/ai/arrow-up-left.svg';
import arrowUpIcon from '../assets/icons/explore/ai/arrow-up.svg';
import rotateIcon from '../assets/icons/explore/ai/rotate.svg';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightSmallIcon from '../assets/icons/explore/chevron-right-small.svg';
import aiIcon from '../assets/icons/profile/ai-sparkle.svg';
import { BottomSheet } from '../components/BottomSheet';
import {
  SEOUL_DETAIL,
  SEOUL_DISTRICTS,
  SEOUL_WHOLE,
  answerAckText,
  conditionSentence,
  greetingText,
  nextQuestion,
  parseConditions,
  questionOptions,
  questionText,
  toConditionParams,
  type AiConditions,
  type AiQuestion,
} from '../utils/aiSearchMock';
// 상단(뒤로가기·제목)은 일반검색 화면과 같은 스타일 사용
import searchStyles from './ExploreSearchPage.module.css';
import styles from './ExploreAiSearchPage.module.css';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  lines: string[];
  // AI가 선택지로 물어본 질문과 사용자가 고른 답
  question?: AiQuestion;
  answer?: string;
}

const EXAMPLES = [
  '서울에서 15만 원 이하로 졸업사진 찍고 싶어요',
  '자연스러운 분위기의 프로필 사진을 원해요',
  '웨딩사진을 따뜻한 색감으로 편집하고 싶어요',
];

function doneMessageLines(conditions: AiConditions) {
  return ['조건을 모두 확인했어요!', `${conditionSentence(conditions)}를 찾아볼게요.`];
}

export function ExploreAiSearchPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conditions, setConditions] = useState<AiConditions>({ field: '촬영' });
  const [asked, setAsked] = useState<AiQuestion[]>([]);
  const [done, setDone] = useState(false);
  const [districtSheetOpen, setDistrictSheetOpen] = useState(false);
  const nextId = useRef(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const started = messages.length > 0;

  // 새 메시지가 생기면 맨 아래로 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, done]);

  const message = (role: ChatMessage['role'], lines: string[], question?: AiQuestion) => ({
    id: nextId.current++,
    role,
    lines,
    question,
  });

  // 처음 문장 보내기: 문장에서 조건을 뽑고, 빠진 조건이 있으면 물어봄
  const start = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const parsed = parseConditions(trimmed);
    const question = nextQuestion(parsed, []);
    const greeting = greetingText(parsed);

    setConditions(parsed);
    setAsked(question ? [question] : []);
    setDone(!question);
    setMessages([
      message('user', [trimmed]),
      question
        ? message('ai', [greeting, questionText(question)], question)
        : message('ai', [greeting, ...doneMessageLines(parsed)]),
    ]);
    setInput('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    start(input);
  };

  // 선택지로 답하기
  const answer = (messageId: number, question: AiQuestion, option: string) => {
    if (question === 'regionDetail' && option === SEOUL_DETAIL) {
      setDistrictSheetOpen(true);
      return;
    }

    let next: AiConditions = conditions;
    if (question === 'budget') next = { ...conditions, budget: option };
    if (question === 'region') next = { ...conditions, region: option };
    if (question === 'regionDetail') {
      next = { ...conditions, region: option === SEOUL_WHOLE ? '서울' : `서울 ${option}` };
    }

    const nextAsked = asked.includes(question) ? asked : [...asked, question];
    const following = nextQuestion(next, nextAsked);
    const answerLabel =
      question === 'regionDetail' && option !== SEOUL_WHOLE ? `서울 ${option}` : option;

    setConditions(next);
    setAsked(following ? [...nextAsked, following] : nextAsked);
    setDone(!following);
    setMessages((prev) => [
      ...prev.map((m) => (m.id === messageId ? { ...m, answer: option } : m)),
      message('user', [answerLabel]),
      following
        ? message('ai', [answerAckText(question, answerLabel), questionText(following)], following)
        : message('ai', doneMessageLines(next)),
    ]);
  };

  // 다시 시작: 처음 화면으로
  const restart = () => {
    setMessages([]);
    setConditions({ field: '촬영' });
    setAsked([]);
    setDone(false);
    setInput('');
    window.scrollTo({ top: 0 });
  };

  const pendingRegionDetail = messages.find(
    (m) => m.question === 'regionDetail' && m.answer === undefined,
  );

  return (
    <main className={started ? `${styles.page} ${styles.pageChat}` : styles.page}>
      <header className={`${searchStyles.header} ${styles.header}`}>
        <Link to="/explore/search" className={searchStyles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={searchStyles.title}>AI SEARCH</h1>
        {started && (
          <button type="button" className={styles.restart} onClick={restart}>
            <img src={rotateIcon} alt="" />
            다시 시작
          </button>
        )}
      </header>

      {!started ? (
        <>
          <section className={styles.intro}>
            <img className={styles.introIcon} src={aiIcon} alt="" />
            <h2 className={styles.introTitle}>어떤 작업을 원하시나요?</h2>
            <p className={styles.introText}>원하는 촬영·편집 조건을 자유롭게 입력해 주세요</p>
          </section>

          <section aria-labelledby="ai-examples-title">
            <h2 id="ai-examples-title" className={styles.examplesTitle}>
              이렇게 검색해 보세요
            </h2>
            <ul className={styles.examples}>
              {EXAMPLES.map((example) => (
                <li key={example}>
                  <button type="button" className={styles.example} onClick={() => start(example)}>
                    <span>{example}</span>
                    <img src={arrowUpLeftIcon} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* 하단바 바로 위에 고정되는 입력창 */}
          <form className={styles.inputBox} onSubmit={handleSubmit}>
            <textarea
              className={styles.input}
              placeholder="원하는 촬영·편집 조건을 입력해 주세요..."
              aria-label="원하는 조건"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                // Enter로 보내기, Shift+Enter는 줄바꿈 (한글 조합 중에는 무시)
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  start(input);
                }
              }}
            />
            <button
              type="submit"
              className={styles.send}
              aria-label="보내기"
              disabled={!input.trim()}
            >
              <img src={arrowUpIcon} alt="" />
            </button>
          </form>
        </>
      ) : (
        <>
          <ol className={styles.chat} aria-live="polite">
            {messages.map(({ id, role, lines, question, answer: chosen }) =>
              role === 'user' ? (
                <li key={id} className={styles.userMessage}>
                  {lines[0]}
                </li>
              ) : (
                <li key={id} className={styles.aiMessage}>
                  <img className={styles.aiAvatar} src={aiIcon} alt="" />
                  <div className={styles.aiBody}>
                    {lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {question && (
                      <div className={styles.options}>
                        {questionOptions(question).map((option, _index, options) => {
                          // 세부 지역(구)을 고른 경우엔 "세부 지역 선택"을 선택 표시
                          const isChosen =
                            chosen === option ||
                            (option === SEOUL_DETAIL &&
                              chosen !== undefined &&
                              !options.includes(chosen));
                          return (
                            <button
                              key={option}
                              type="button"
                              className={
                                isChosen ? `${styles.option} ${styles.optionChosen}` : styles.option
                              }
                              aria-pressed={isChosen}
                              // 이미 답한 질문은 다시 고를 수 없음
                              disabled={chosen !== undefined}
                              onClick={() => answer(id, question, option)}
                            >
                              {option}
                              {option === SEOUL_DETAIL && (
                                <img src={chevronRightSmallIcon} alt="" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              ),
            )}
          </ol>
          <div ref={chatEndRef} className={styles.chatEnd} />

          {done && (
            <div className={styles.ctaBar}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => navigate(`/explore/ai/results?${toConditionParams(conditions)}`)}
              >
                조건에 맞는 작가 보기
                <img src={arrowRightIcon} alt="" />
              </button>
            </div>
          )}
        </>
      )}

      {districtSheetOpen && pendingRegionDetail && (
        <BottomSheet title="서울 세부 지역" onClose={() => setDistrictSheetOpen(false)}>
          <div className={styles.districts}>
            {SEOUL_DISTRICTS.map((district) => (
              <button
                key={district}
                type="button"
                className={styles.district}
                onClick={() => {
                  setDistrictSheetOpen(false);
                  answer(pendingRegionDetail.id, 'regionDetail', district);
                }}
              >
                {district}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </main>
  );
}
