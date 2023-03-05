using BigCombinatorics

function ncr(n, r)
    if r > n
        return 0
    end
    return factorial(big(n)) / (factorial(big(r)) * factorial(big(n-r)))
end

function npr(n, r)
    if r > n
        return 0
    end
    return factorial(big(n)) / factorial(big(n-r))
end

UPPER_LIMIT = @show length(string((BigInt(2)^8)^1024))

# n = [0:256;]

# fn1(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-4x) * 78341 ^ (x)
# fn2(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-3x) * 42451 ^ (x)
# fn3(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-2x) * 1863 ^ (x)

# @show sum(fn1.([1:256;])) + sum(fn2.([1:341;])) + sum(fn3.([1:512;]))

SUM = BigInt(0)


for j in 0:512
  if 2j > 1024
    break
  end
  @show j
  for k in 0:341
    if 2j + 3k > 1024
      break
    end
    for l in 0:256
      if 2j + 3k + 4l > 1024
        break
      end

      # global SUM += 128^i * 1863^j * 42451^k * 78341^l * ncr(1024, i) * ncr(1024-i, j) * ncr(1024-i-j, k) * ncr(1024-i-j-k, l)
      global SUM += Multinomial(1024-2j-3k-4l, j, k, l) * BigInt(128)^(1024-2j-3k-4l) * BigInt(1863)^j * BigInt(42451)^k * BigInt(78341)^l
    end
  end
end


@show SUM