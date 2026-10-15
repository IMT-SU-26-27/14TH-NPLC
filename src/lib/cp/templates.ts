import type { CpLanguage } from "@/types/cp";

// Starter code for each language. Java must use `public class Main` on Judge0.
export const STARTER_CODE: Record<CpLanguage, string> = {
  python: `import sys

def main():
    data = sys.stdin.read().split()
    # write your solution here


main()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // write your solution here
    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        // write your solution here
    }
}
`,
};

export const MONACO_LANGUAGE: Record<CpLanguage, string> = {
  python: "python",
  cpp: "cpp",
  java: "java",
};
