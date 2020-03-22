(() => {
  const wrapper = document.querySelector('.wrap');

  //1.최초 그려지는 메모
  const initiateMemo = memos => {
    const memoBlock = _getBlock(memos);
    const memoHeader = _getHeader(memos);
    const memoBody = _getBody(memos);
    memoBlock.append(memoHeader);
    memoBlock.append(memoBody);
    wrapper.append(memoBlock);
  };
  //메모 생성 함수
  const createMemo = dataSet => {
    dataSet.id = _getCnt();
    _setMemo(dataSet);
    const memoBlock = _getBlock(dataSet);
    const memoHeader = _getHeader(dataSet);
    const memoBody = _getBody(dataSet);
    memoBlock.append(memoHeader);
    memoBlock.append(memoBody);
    wrapper.append(memoBlock);
  };

  //우클릭 새로운 메모 생성
  const clickRight = e => {
    const dataSet = {
      id: '',
      x: 0,
      y: 0,
      text: 'jgi92@naver.com',
      width: '200px',
      height: '100px'
    };
    dataSet.x = e.clientX;
    dataSet.y = e.clientY;
    if (e.button === 2) {
      createMemo(dataSet);
    }
  };

  /// 하단 부는 메모를 컨트롤 하기위한 유틸 ///
  const _getDom = tag => document.createElement(tag);
  const _getBlock = obj => {
    const memo = document.createElement('div');
    memo.className = 'memo';
    memo.id = obj.id;

    memo.style.position = 'fixed';
    memo.style.top = `${obj.y}px`;
    memo.style.left = `${obj.x}px`;

    memo.addEventListener('mouseover', e => {
      e.stopPropagation();
      wrapper.appendChild(memo);
    });

    return memo;
  };

  //메모의 헤더와 헤더에서 사용되는 함수들
  const _getHeader = dataSet => {
    const header = _getDom('div');
    const H1 = _getDom('h1');
    const close = _getDom('Button');
    const span = _getDom('span');
    header.className = 'header';
    H1.className = 'blind';
    H1.textContent = '메모장';
    close.className = 'btn_close';
    span.textContent = '닫기';
    span.className = 'blind';
    close.append(span);
    header.append(H1);
    header.append(close);

    const dragListener = e => {
      e.dataTransfer.setData('memoId', e.target.id);
      const memos = _getAllMemos();
      const target = memos[+e.target.id];
      const fixedOffset = e.clientX - target.x;
      e.dataTransfer.setData('fixedOffset', fixedOffset);
    };
    header.addEventListener('mouseover', e => {
      const memo = e.target.offsetParent;
      memo.setAttribute('draggable', true);
      memo.addEventListener('dragstart', dragListener);
    });

    header.addEventListener('mouseout', e => {
      const memo = e.target.offsetParent;
      memo.setAttribute('draggable', false);
      memo.removeEventListener('dragstart', dragListener);
    });

    close.addEventListener('click', e => {
      _removeMemo(dataSet.id);
      e.target.offsetParent.offsetParent.remove();
      _sortId(); //아이디가 고유값이 아니기 때문에 배열의 인덱스로 컨드롤 하기위해서 삭제르 진행할 경우메모의 id => index를 정렬해주는 작업이 필요
    });

    return header;
  };
  //메모의 바디와 바디에서 사용되는 함수들
  const _getBody = dataSet => {
    const content = _getDom('div');
    const textarea = _getDom('div');
    const size = _getDom('button');
    content.className = 'content';
    content.style.overflow = 'auto';
    content.style.width = dataSet.width;
    content.style.height = dataSet.height;

    textarea.className = 'textarea';
    textarea.setAttribute('contenteditable', true);
    textarea.setAttribute('placeholder', '메모를 작성하세요...');
    // textarea.style.width = dataSet.width;

    // textarea.style.height = dataSet.height;
    textarea.style.textAlign = 'left';

    textarea.innerHTML = dataSet.text;
    size.className = 'btn_size';
    content.append(textarea);
    content.append(size);

    textarea.addEventListener('focusout', e => {
      dataSet.text = e.target.innerText;
      _setMemoIndex(dataSet, dataSet.id); //메모를 저장할 때 배열의 위치에 넣기위해서 실행
    });

    size.addEventListener('mouseover', e => {
      content.style.resize = 'both';
      const memos = _getAllMemos();
      const target = memos[+dataSet.id];
      const inter = setInterval(() => {
        const mymemo = e.target.offsetParent.offsetParent;
        const currentWidth = mymemo.clientWidth;
        const currentHeight = mymemo.clientHeight;
        target.width = currentWidth - 20 + 'px';
        target.height = currentHeight - 30 + 'px';
        _setMemoIndex(target, target.id);
      }, 500);

      setTimeout(() => {
        clearInterval(inter);
      }, 6 * 1000);

      // clearInterval(inter);
    });

    return content;
  };

  // 메모의 화면과 데이터를 동기화 시켜 주기위해서 작업하는 함수들
  //현재 localStorage에 등록되어 있는 배열의 길이를 구하기 위한 함수 => 메모 객체의 인덱스 = 아이디 동기화 작업을 진행 시켜주어야 함.
  const _getCnt = () => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    if (memos) {
      return memos.length;
    }
    return 0;
  };
  //localStorage에 담겨있는 모든 메모의 정보를 가져온다.
  const _getAllMemos = () => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    if (memos) {
      return memos;
    }
    localStorage.setItem('memos', '[]');
    return null;
  };
  //새로운 메모가 생성될 때 초기에 아이디를 잡기위해서 사용
  const _setMemo = dataSet => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    memos.push(dataSet);
    localStorage.setItem('memos', JSON.stringify(memos));
  };
  //메모에 글을 작성한 다음 localStorage에 데이터를 저장하기위해서 사용
  const _setMemoIndex = (dataSet, index) => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    const lineBr = dataSet.text.replace(/\n/g, '<br/>');
    dataSet.text = lineBr;
    memos[index] = dataSet;
    localStorage.setItem('memos', JSON.stringify(memos));
  };
  //메모의 아이다 = index를 이용하여 localStorage에 담겨있는 해당 메모 데이터를 삭제
  const _removeMemo = id => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    const filtered = memos.filter(m => m.id !== id);
    localStorage.setItem('memos', JSON.stringify(filtered));
  };
  //메모를 삭제한 다음 새로운 메모를 생성할 경우 index의 메칭을 이루기 위해서 한 번의 sorting 작업이 필요.
  const _sortId = async () => {
    const memos = JSON.parse(localStorage.getItem('memos'));
    const sort = memos.map((m, i) => {
      return {
        ...m,
        id: i
      };
    });
    await localStorage.setItem('memos', JSON.stringify(sort));
    location.reload();
  };

  //초기화 작업 //
  //해당 메모보드가 실행될 경우 초기화 작업을 진행 하는 부분
  const init = () => {
    wrapper.addEventListener('mousedown', clickRight); //우클릭 확인을 위해 사용
    wrapper.addEventListener('drop', e => {
      e.preventDefault();
      const data = e.dataTransfer.getData('memoId');
      const fixedOffset = e.dataTransfer.getData('fixedOffset');
      const memos = _getAllMemos();
      const memo = memos[+data];

      // memo.x = e.clientX - Number(fixedOffset);
      memo.x = e.clientX;
      memo.y = e.clientY - 7;

      _setMemoIndex(memo, data);
      const target = document.getElementById(data);

      // target.style.left = e.clientX - Number(fixedOffset) + 'px';
      target.style.left = e.clientX + 'px';
      target.style.top = e.clientY - 7 + 'px';

      wrapper.appendChild(target);
      location.reload();
    });
    wrapper.addEventListener('dragover', e => {
      e.preventDefault();
    });

    const memos = _getAllMemos();
    if (memos) {
      // _sortId();
      memos.forEach(d => initiateMemo(d));
    }
  };

  //정상적으로 화면에 보드 타겟에 해당하는 돔이 있으면 초기화 작업을 진행 한다.
  if (wrapper) {
    init();
  }
})();
