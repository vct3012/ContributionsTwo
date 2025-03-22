import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const DATA_FILE_PATH = "./data.json";

// Hàm tạo commit với timestamp cụ thể
const createCommit = async (commitDate) => {
  const data = { date: commitDate.toISOString() };
  await jsonfile.writeFile(DATA_FILE_PATH, data);

  const git = simpleGit();
  await git.add([DATA_FILE_PATH]);
  await git.commit(commitDate.toISOString(), { "--date": commitDate.toISOString() });
};

// Hàm tạo commits cho một ngày cụ thể với 2-3 contributions
const createDailyCommits = async (day) => {
  // Số lượng commits trong ngày (2 hoặc 3)
  const numCommits = random.int(2, 3);
  console.log(`Tạo ${numCommits} commit cho ngày ${day.format("YYYY-MM-DD")}`);

  // Sử dụng Set để đảm bảo các timestamp là duy nhất
  const usedTimestamps = new Set();

  for (let i = 0; i < numCommits; i++) {
    let commitDate;

    // Tạo timestamp ngẫu nhiên trong ngày cho đến khi duy nhất
    do {
      const randomHour = random.int(0, 23);
      const randomMinute = random.int(0, 59);
      const randomSecond = random.int(0, 59);

      commitDate = day.clone().set({
        hour: randomHour,
        minute: randomMinute,
        second: randomSecond,
      });

      // Nếu timestamp vượt quá thời gian hiện tại, gán lại bằng thời gian hiện tại
      if (commitDate.isAfter(moment())) {
        commitDate = moment();
      }
    } while (usedTimestamps.has(commitDate.toISOString()));

    usedTimestamps.add(commitDate.toISOString());
    console.log(`Tạo commit tại: ${commitDate.toISOString()}`);
    await createCommit(commitDate);
  }
};

// Hàm tạo commits từ ngày 01/01/2024 đến hiện tại
const generateCommits = async () => {
  const startDate = moment("2024-01-01");
  const currentDate = moment(); // Thời gian hiện tại

  // Lặp qua từng ngày từ startDate đến hiện tại
  for (let day = startDate.clone(); day.isSameOrBefore(currentDate, "day"); day.add(1, "day")) {
    // Bỏ qua ngày thứ Sáu (Friday: 5)
    if (day.day() === 5) {
      console.log(`Bỏ qua thứ Sáu: ${day.format("YYYY-MM-DD")}`);
      continue;
    }

    await createDailyCommits(day);
  }

  // Sau khi tạo tất cả commits, đẩy lên remote repository
  console.log("Đang đẩy các commits lên remote...");
  const git = simpleGit();
  await git.push();
};

generateCommits();
